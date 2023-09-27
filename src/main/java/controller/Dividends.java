package controller;

import java.time.LocalDate;

import jakarta.json.bind.annotation.JsonbDateFormat;

public record Dividends(@JsonbDateFormat(value = "dd/MM/yyyy") LocalDate pd, double v) {
    
}
