package controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import jakarta.json.bind.JsonbBuilder;

public class Test {
    public static void main(String[] args) throws IOException {
        String ticker = "mxrf11";
        String url = String.format("https://statusinvest.com.br/fundos-imobiliarios/%s", ticker);
        Document doc = Jsoup.connect(url).get();
        Function<String, Double> extract = (selector) -> Double.parseDouble(
                doc.select(selector).first().text().replaceAll("[^0-9,.]", "").replace(".", "").replace(",", "."));
        Double price = extract.apply(
                "#main-2 > div.container.pb-7 > div.top-info.d-flex.flex-wrap.justify-between.mb-3.mb-md-5 > div.info.special.w-100.w-md-33.w-lg-20 > div > div:nth-child(1) > strong");
        Double pvp = extract.apply(
                "#main-2 > div.container.pb-7 > div:nth-child(5) > div > div:nth-child(2) > div > div:nth-child(1) > strong");
        Double cotistas = extract.apply(
                "#main-2 > div.container.pb-7 > div:nth-child(5) > div > div:nth-child(6) > div > div:nth-child(1) > strong");
        Double liquidez = extract.apply(
                "#main-2 > div.container.pb-7 > div:nth-child(6) > div > div > div.info.p-0 > div > div > div > strong");
        Elements div = doc.select("#earning-section #results");
        String dl = div.attr("value");
        List<Dividends> dividends = JsonbBuilder.create().fromJson(dl, new ArrayList<Dividends>() {
        }.getClass().getGenericSuperclass());
        FIIData out = new FIIData(ticker, price, pvp, cotistas, liquidez, dividends);
        System.out.println(JsonbBuilder.create().toJson(out));
    }

    public static void main2(String[] args) throws IOException {
        String ticker = "sanb11";
        String url = String.format("https://statusinvest.com.br/acoes/%s", ticker);
        Document doc = Jsoup.connect(url).get();
        Function<String, Double> extract = (selector) -> Double.parseDouble(
                doc.select(selector).first().text().replaceAll("[^0-9,.]", "").replace(",", "."));
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
        StockData out = new StockData(ticker, price, vpa, lpa, pvp, dividends);
        System.out.println(JsonbBuilder.create().toJson(out));
    }
}
