package controller;

import java.util.List;

public record FIIData(String ticker, double preco, double pvp, double cotistas, double liquidez, List<Dividends> dividendos) {
}