package com.kanavoogle.skills.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@RequiredArgsConstructor
@Getter
@Setter
@Document("locations")
@CompoundIndexes({
        @CompoundIndex(
                name = "state_search_idx",
                def = "{'state': 1, 'searchName': 1}"
        ),
        @CompoundIndex(
                name = "state_postcode_idx",
                def = "{'state': 1, 'postcode': 1}"
        ),
        @CompoundIndex(
                name = "location_unique_idx",
                def = "{'state': 1, 'suburb': 1, 'postcode': 1}",
                unique = true
        )
})
public class Location {

    @Id
    private String id;

    private String state;
    private String suburb;
    private String searchName;
    private String postcode;
    private String source;
    private Instant importedAt;

}