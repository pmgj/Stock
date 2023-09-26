package controller;

import java.util.List;

public record OutputData(String ticker, double preco, double vpa, double lpa, double pvp, List<Dividends> dividendos) {
}