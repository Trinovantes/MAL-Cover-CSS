export interface DefaultColumns {
    id: number
    createdAt: string
    updatedAt: string
}

export type CreationOmit = 'id' | 'createdAt' | 'updatedAt'