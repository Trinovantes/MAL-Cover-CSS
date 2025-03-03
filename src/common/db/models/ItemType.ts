export const ALL_ITEM_TYPES = [
    'anime',
    'manga',
] as const

export type ItemType = typeof ALL_ITEM_TYPES[number]
