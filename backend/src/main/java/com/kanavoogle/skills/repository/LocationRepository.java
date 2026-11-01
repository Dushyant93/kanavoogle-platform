package com.kanavoogle.skills.repository;

import com.kanavoogle.skills.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository
        extends MongoRepository<Location, String> {

    List<Location> findTop10ByStateAndPostcodeOrderBySuburbAsc(
        String state,
        String postcode
    );

    boolean existsByStateAndSuburbIgnoreCaseAndPostcode(String state, String suburb, String postcode);

    Optional<Location> findByStateAndSuburbIgnoreCaseAndPostcode(
            String state,
            String suburb,
            String postcode
    );

}