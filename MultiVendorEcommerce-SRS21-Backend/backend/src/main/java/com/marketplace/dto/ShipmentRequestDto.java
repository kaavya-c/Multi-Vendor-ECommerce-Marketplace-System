package com.marketplace.dto;

public class ShipmentRequestDto {
    public String courierName;
    public double weight = 0.5; // kg
    public double length = 15;  // cm
    public double breadth = 10; // cm
    public double height = 5;   // cm
    public String pickupPincode;
    public String deliveryPincode;
}
