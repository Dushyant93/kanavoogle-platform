package com.kanavoogle.skills.controller;

import com.kanavoogle.skills.dto.LocationOption;
import com.kanavoogle.skills.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/api/locations")
@RestController
public class LocationController {
    private final LocationService locationService;

    @GetMapping("/search")
    public List<LocationOption> search(@RequestParam String state,
                                       @RequestParam String q) {
        return locationService.searchByName(state, q)
                .stream()
                .map(LocationOption::from)
                .toList();
    }

    @GetMapping("/postcode/{postcode}")
    public List<LocationOption> postcode(@RequestParam String state,
            @PathVariable String postcode) {
        return locationService.searchByPostCode(state, postcode)
                .stream()
                .map(LocationOption::from)
                .toList();
    }
}
