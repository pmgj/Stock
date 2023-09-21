package controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
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
    public String getStockPage(@QueryParam("ticker") String ticker, @QueryParam("type") String type)
            throws IOException, InterruptedException {
        String url = String.format("https://investidor10.com.br/acoes/%s", ticker);
        Document doc = Jsoup.connect(url).get();
        Function<String, Double> extract = (selector) -> {
            Element elem = doc.select(selector).first();
            String text = elem.text();
            String value = text.replaceAll("[^0-9,.]", "").replace(",", ".");
            return Double.parseDouble(value);
        };
        Double price = extract.apply("#cards-ticker > div._card.cotacao > div._card-body > div > span");
        Double vpa = extract.apply(
                "#table-indicators > div:nth-child(17) > div.value.d-flex.justify-content-between.align-items-center > span");
        Double lpa = extract.apply(
                "#table-indicators > div:nth-child(18) > div.value.d-flex.justify-content-between.align-items-center > span");

        String url2 = String.format("https://playinvest.com.br/dividendos/%s", ticker);
        Document doc2 = Jsoup.connect(url2).get();
        Elements trs = doc2.select("#dividendTable tbody tr");
        List<Dividends> dividends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (int i = 0; i < trs.size(); i++) {
            Elements tr = trs.eq(i);
            Elements tds = tr.select("td");
            LocalDate date;
            try {
                date = LocalDate.parse(tds.eq(2).text(), formatter);
            } catch (DateTimeParseException ex) {
                Dividends d = dividends.get(dividends.size() - 1);
                date = d.payDate();
            }
            Double dividend = Double.parseDouble(tds.eq(4).text());
            dividends.add(new Dividends(date, dividend));
        }

        OutputData out = new OutputData(ticker, price, vpa, lpa, dividends);
        return JsonbBuilder.create().toJson(out);
    }
}
