import type {
    AustralianState,
    LocationOption,
} from '../types/location'

import { request } from './http'

export const locationService = {

    searchByArea(
        state: AustralianState,
        query: string,
        signal?: AbortSignal,
    ) {

        const params = new URLSearchParams({
            state,
            q: query,
        })

        return request<LocationOption[]>(
            `/locations/search?${params.toString()}`,
            {
                signal,
            },
        )
    },

    searchByPostcode(
        state: AustralianState,
        postcode: string,
        signal?: AbortSignal,
    ) {

        const params = new URLSearchParams({
            state,
        })

        return request<LocationOption[]>(
            `/locations/postcode/${encodeURIComponent(postcode)}?${params.toString()}`,
            {
                signal,
            },
        )
    },
}