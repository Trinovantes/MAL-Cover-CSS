export type ErrorResponse = {
    errorMessage: string
}

export type RedirectResponse = {
    url: string
}

export type SuccessResponse = {
    message: string
}

export type UserResponse = {
    malUserId: number
    malUsername: string
    lastChecked: string | null
}
