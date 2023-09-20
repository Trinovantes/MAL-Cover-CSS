export type ErrorResponse = {
    status: number
    errorMessage: string
}

export type RedirectResponse = {
    url: string
}

export type SuccessResponse = {
    message: string
}

export type UserResponse = {
    id: number
    malUserId: number
    malUsername: string
    lastChecked: string | null
}
