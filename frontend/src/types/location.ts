export type AustralianState =
    | 'ACT'
    | 'NSW'
    | 'NT'
    | 'QLD'
    | 'SA'
    | 'TAS'
    | 'VIC'
    | 'WA'

export type LocationOption = {
    state: AustralianState
    postcode: string
    suburb: string
}

export type LocationSearchMode =
    | 'area'
    | 'postcode'