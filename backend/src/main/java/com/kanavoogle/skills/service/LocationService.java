package com.kanavoogle.skills.service;

import com.kanavoogle.skills.model.Location;
import com.kanavoogle.skills.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class LocationService {
    private final MongoTemplate mongoTemplate;
    private final LocationRepository locationRepository;

    public List<Location> searchByName(String state, String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        String normalized = query.trim().toLowerCase(Locale.ROOT);

        Query mongoQuery = new Query();

        mongoQuery.addCriteria(
                Criteria.where("state").is(state.trim().toUpperCase(Locale.ROOT))
                        .and("searchName").regex("^" + Pattern.quote(normalized)));

        mongoQuery.limit(10);

        return mongoTemplate.find(mongoQuery, Location.class);
    }

    public List<Location> searchByPostCode(String state, String postcode) {
        if (!postcode.matches("\\d{4}")) {
            return List.of();
        }

        return locationRepository.findTop10ByStateAndPostcodeOrderBySuburbAsc(state.trim().toUpperCase(Locale.ROOT), postcode);
    }
}
