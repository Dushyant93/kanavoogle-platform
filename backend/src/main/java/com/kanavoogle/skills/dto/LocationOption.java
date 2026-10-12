package com.kanavoogle.skills.dto;

import com.kanavoogle.skills.model.Location;

public record LocationOption(String state, String postcode, String suburb) {
    public static LocationOption from(Location location) {
        return new LocationOption(location.getState(), location.getPostcode(), location.getSuburb());
    }
}
