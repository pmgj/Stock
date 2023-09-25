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

public class Test {
    public static void main2(String[] args) throws IOException {
        String ticker = "taee11";
        String url = String.format("https://investidor10.com.br/%s/%s", "acoes", ticker);
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

        String url2 = String.format("https://playinvest.com.br/%s/%s", "dividendos", ticker);
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
        System.out.println(JsonbBuilder.create().toJson(out));
    }

    public static void main(String[] args) throws IOException {
        String ticker = "sanb11";
        String url = String.format("https://statusinvest.com.br/%s/%s", "acoes", ticker);
        Document doc = Jsoup.connect(url).get();
        Function<String, Double> replaceString = str -> {
            String ret = str.replaceAll("[^0-9,.]", "").replace(",", ".");
            return Double.parseDouble(ret);
        };
        Function<String, Double> extract = (selector) -> {
            Element elem = doc.select(selector).first();
            String text = elem.text();
            return replaceString.apply(text);
        };
        Double price = extract.apply(
                "#main-2 > div:nth-child(4) > div > div.pb-3.pb-md-5 > div > div.info.special.w-100.w-md-33.w-lg-20 > div > div:nth-child(1) > strong");
        Double vpa = extract.apply(
                "#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(9) > div > div > strong");
        Double lpa = extract.apply(
                "#indicators-section > div.indicator-today-container > div > div:nth-child(1) > div > div:nth-child(11) > div > div > strong");
        Elements div = doc.select("#earning-section #results");
        String dl = div.attr("value");
        List<JSONDividends> list = JsonbBuilder.create().fromJson(dl, new ArrayList<JSONDividends>() {
        }.getClass().getGenericSuperclass());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        List<Dividends> dividends = new ArrayList<>();
        for (JSONDividends jsonDividends : list) {
            LocalDate date;
            try {
                date = LocalDate.parse(jsonDividends.pd(), formatter);
            } catch (DateTimeParseException ex) {
                Dividends d = dividends.get(dividends.size() - 1);
                date = d.payDate();
            }
            Double dividend = jsonDividends.v();
            dividends.add(new Dividends(date, dividend));
        }
        OutputData out = new OutputData(ticker, price, vpa, lpa, dividends);
        System.out.println(JsonbBuilder.create().toJson(out));
    }
}
