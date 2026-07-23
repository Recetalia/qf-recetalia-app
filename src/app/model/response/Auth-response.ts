export interface AuthResponse {
    status: string
    answer: Answer
    applicationProvider: string
    metadata: any
    serverDateTime: string
}

export interface Answer {
    token: string
    refreshToken: any
    username: string
    role: string
}
