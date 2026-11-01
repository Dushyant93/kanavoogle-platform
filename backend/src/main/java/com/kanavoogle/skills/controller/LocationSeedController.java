package com.kanavoogle.skills.controller;

import com.kanavoogle.skills.service.LocationSeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/seed")
@RequiredArgsConstructor
public class LocationSeedController {

    private final LocationSeedService locationSeedService;

    @PostMapping("/locations")
    public ResponseEntity<?> seedLocations(
            @RequestHeader("X-SEED-KEY") String seedKey) {

        return ResponseEntity.ok(locationSeedService.seed(seedKey));
    }
}
