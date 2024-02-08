export type PlayerPB = {
    user: string
    time: number
}

export type TrackPBs = {
    guid: string
    trackName: string
    scores: PlayerPB[]
}

export type LeaderboardResponse = {
    result: TrackPBs[]
}