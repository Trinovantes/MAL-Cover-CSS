export interface ErrorResponse {
    errorMessage: string
}

export interface RedirectResponse {
    url: string
}

export interface SuccessResponse {
    message: string
}

export interface UserResponse {
    malUserId: number
    username: string
    lastChecked: Date | null
}
