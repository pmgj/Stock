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

@Path("stock")
public class StockResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getStockPage(@QueryParam("ticker") String ticker)
            throws IOException, InterruptedException {
        String url = String.format("https://statusinvest.com.br/%s/%s", "acoes", ticker);
        Document doc = Jsoup.connect(url).get();
        Function<String, Double> extract = (selector) -> Double.parseDouble(doc.select(selector).first().text().replaceAll("[^0-9,.]", "").replace(",", "."));
        Double price = extract.apply(
                "#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div.info.special.w-100.w-md-33.w-lg-20 > div > div:nth-child(1) > strong");
        Double vpa = extract.apply(
                "#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(9) > div > div > strong");
        Double lpa = extract.apply(
                "#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(11) > div > div > strong");
        Double pvp = extract.apply(
                "#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(4) > div > div > strong");
        Elements div = doc.select("#earning-section #results");
        String dl = div.attr("value");
        List<Dividends> dividends = JsonbBuilder.create().fromJson(dl, new ArrayList<Dividends>() {
        }.getClass().getGenericSuperclass());
        OutputData out = new OutputData(ticker, price, vpa, lpa, pvp, dividends);
        return JsonbBuilder.create().toJson(out);
    }
}
