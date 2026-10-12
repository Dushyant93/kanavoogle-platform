package com.kanavoogle.skills.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanavoogle.skills.model.Location;
import com.kanavoogle.skills.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationSeedService {

    private static final int BATCH_SIZE = 500;

    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.seed.key}")
    private String configuredSeedKey;

    public Map<String, Object> seed(
            String providedSeedKey) {

        validateSeedKey(
                providedSeedKey
        );

        try (InputStream input =
                     new ClassPathResource(
                             "seed/locations.json"
                     ).getInputStream()) {

            List<Location> locations =
                    objectMapper.readValue(
                            input,
                            new TypeReference<List<Location>>() {}
                    );

            int total = locations.size();
            int processed = 0;
            int batchCount = 0;

            for (int start = 0;
                 start < total;
                 start += BATCH_SIZE) {

                int end =
                        Math.min(
                                start + BATCH_SIZE,
                                total
                        );

                List<Location> batch =
                        locations.subList(
                                start,
                                end
                        );

                bulkUpsert(batch);

                processed += batch.size();
                batchCount++;

                System.out.printf(
                        "Seeded %d/%d locations%n",
                        processed,
                        total
                );
            }

            return Map.of(
                    "status", "completed",
                    "processed", processed,
                    "total", total,
                    "batches", batchCount
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Location seed failed",
                    e
            );
        }
    }

    private void bulkUpsert(
            List<Location> batch) {

        BulkOperations bulk =
                mongoTemplate.bulkOps(
                        BulkOperations.BulkMode.UNORDERED,
                        Location.class
                );

        for (Location location : batch) {

            Query query =
                    Query.query(
                            Criteria.where("_id")
                                    .is(
                                            location.getId()
                                    )
                    );

            Update update =
                    new Update()
                            .set(
                                    "state",
                                    location.getState()
                            )
                            .set(
                                    "suburb",
                                    location.getSuburb()
                            )
                            .set(
                                    "searchName",
                                    location.getSearchName()
                            )
                            .set(
                                    "postcode",
                                    location.getPostcode()
                            )
                            .set(
                                    "source",
                                    location.getSource()
                            );

            bulk.upsert(
                    query,
                    update
            );
        }

        bulk.execute();
    }

    private void validateSeedKey(
            String providedSeedKey) {

        if (configuredSeedKey == null
                || configuredSeedKey.isBlank()
                || !configuredSeedKey.equals(
                providedSeedKey
        )) {

            throw new SecurityException(
                    "Invalid seed key"
            );
        }
    }
}
