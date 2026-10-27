package com.marketplace.dto;

import java.util.ArrayList;
import java.util.List;

public class TrackingResponseDto {
    public String awbNumber;
    public String courierName;
    public String status;
    public String currentLocation;
    public String estimatedDeliveryDate;
    public String originLocation;
    public String destinationLocation;
    public int progressPercent;
    public List<CheckpointDto> checkpoints = new ArrayList<>();

    public static class CheckpointDto {
        public String timestamp;
        public String location;
        public String status;
        public String activity;

        public CheckpointDto() {}

        public CheckpointDto(String timestamp, String location, String status, String activity) {
            this.timestamp = timestamp;
            this.location = location;
            this.status = status;
            this.activity = activity;
        }
    }
}
