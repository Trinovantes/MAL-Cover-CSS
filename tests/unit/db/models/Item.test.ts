import { DB_MEMORY } from '@/common/Constants'
import { createDb, DrizzleClient } from '@/common/db/createDb'
import { getMigrations } from '@/common/db/getMigrations'
import { selectItems, upsertItem } from '@/common/db/models/Item'
import { ItemType } from '@/common/db/models/ItemType'
import { getSqlTimestamp } from '@/common/utils/getSqlTimestamp'
import { vi, describe, test, beforeEach, afterEach, expect } from 'vitest'

let db: DrizzleClient

const mocks = vi.hoisted(() => {
    return {
        getSqlTimestamp: vi.fn(),
    }
})

vi.mock('@/common/utils/getSqlTimestamp', () => {
    return {
        getSqlTimestamp: mocks.getSqlTimestamp,
    }
})

beforeEach(async() => {
    db = await createDb(DB_MEMORY, {
        migrations: await getMigrations(),
    })

    vi.mocked(getSqlTimestamp).mockReturnValue('Mocked Date')
})

afterEach(() => {
    db.$client.close()
})

describe('upsertItem', () => {
    test('when item does not exist', () => {
        const item = upsertMockItem(42)
        expect(item.id).toBe(1)
    })

    test('when mediaType does not exist', () => {
        expect(() => upsertMockItem(42, 'fake' as ItemType)).toThrowError(/FOREIGN KEY constraint/)
    })

    test('when item does not exist in non-empty db', () => {
        for (let malId = 1; malId <= 10; malId++) {
            upsertMockItem(malId)
        }

        const item = upsertMockItem(11)
        expect(item.id).toBe(11)
    })

    test('when same item id used for anime and manga', () => {
        upsertMockItem(42, 'anime')
        upsertMockItem(42, 'manga')

        const items = selectItems(db)
        expect(items.length).toBe(2)
    })

    test('when item already exists', () => {
        const oldDate = 'Date 1'
        const newDate = 'Date 2'

        vi.mocked(getSqlTimestamp).mockReturnValue(oldDate)
        const oldItem = upsertMockItem(1, 'anime')

        vi.mocked(getSqlTimestamp).mockReturnValue(newDate)
        const newItem = upsertMockItem(1, 'anime', 'Some URL')

        expect(newItem.id).toBe(oldItem.id)
        expect(newItem.malId).toBe(oldItem.malId)
        expect(newItem.mediaType).toBe(oldItem.mediaType)
        expect(newItem.imgUrl).not.toBeNull()
        expect(newItem.createdAt).toBe(oldDate)
        expect(newItem.updatedAt).toBe(newDate)
        expect(selectItems(db).length).toBe(1)
    })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function upsertMockItem(malId: number, mediaType: ItemType = 'anime', imgUrl: string | null = null) {
    return upsertItem(db, {
        mediaType,
        malId,
        imgUrl,
    })
}
