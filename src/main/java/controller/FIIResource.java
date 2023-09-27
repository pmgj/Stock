package controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("fii")
public class FIIResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getStockPage(@QueryParam("ticker") String ticker)
            throws IOException, InterruptedException {
        String url = String.format("https://statusinvest.com.br/fundos-imobiliarios/%s", ticker);
        Document doc = Jsoup.connect(url).get();
        Function<String, Double> extract = (selector) -> Double.parseDouble(
                doc.select(selector).first().text().replaceAll("[^0-9,.]", "").replace(",", "."));
        Double price = extract.apply(
                "#main-2 > div.container.pb-7 > div.top-info.d-flex.flex-wrap.justify-between.mb-3.mb-md-5 > div.info.special.w-100.w-md-33.w-lg-20 > div > div:nth-child(1) > strong");
        Double pvp = extract.apply(
                "#main-2 > div.container.pb-7 > div:nth-child(5) > div > div:nth-child(2) > div > div:nth-child(1) > strong");
        Elements div = doc.select("#earning-section #results");
        String dl = div.attr("value");
        List<Dividends> dividends = JsonbBuilder.create().fromJson(dl, new ArrayList<Dividends>() {
        }.getClass().getGenericSuperclass());
        OutputData out = new OutputData(ticker, price, 0, 0, pvp, dividends);
        return JsonbBuilder.create().toJson(out);
    }
}
