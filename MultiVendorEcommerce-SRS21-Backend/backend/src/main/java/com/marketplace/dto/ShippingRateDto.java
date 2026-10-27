package com.marketplace.dto;

public class ShippingRateDto {
    public String courierName;
    public String courierCode;
    public double rating;
    public int etdDays;
    public double freightCharge;
    public double codCharge;
    public double totalCharge;

    public ShippingRateDto() {
    }

    public ShippingRateDto(String courierName, String courierCode, double rating, int etdDays, double freightCharge, double codCharge) {
        this.courierName = courierName;
        this.courierCode = courierCode;
        this.rating = rating;
        this.etdDays = etdDays;
        this.freightCharge = freightCharge;
        this.codCharge = codCharge;
        this.totalCharge = freightCharge + codCharge;
    }
}
