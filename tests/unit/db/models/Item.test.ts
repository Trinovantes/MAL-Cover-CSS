import { DB_MEMORY } from '@/common/Constants'
import { createDb } from '@/common/db/createDb'
import { getMigrations } from '@/common/db/getMigrations'
import { migrateDb } from '@/common/db/migrateDb'
import { selectItems, upsertItem } from '@/common/db/models/Item'
import { ItemType } from '@/common/db/models/ItemType'
import { getSqlTimestamp } from '@/common/utils/getSqlTimestamp'
import { vi, describe, test, beforeEach, afterEach, expect } from 'vitest'

let dbHandles: ReturnType<typeof createDb>
let db: (typeof dbHandles)['db']

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
    dbHandles = createDb(DB_MEMORY, false)
    db = dbHandles.db

    const migrations = getMigrations()
    await migrateDb(dbHandles.db, migrations)

    vi.mocked(getSqlTimestamp).mockReturnValue('Mocked Date')
})

afterEach(() => {
    dbHandles.client.close()
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
        upsertMockItem(42, ItemType.Anime)
        upsertMockItem(42, ItemType.Manga)

        const items = selectItems(db)
        expect(items.length).toBe(2)
    })

    test('when item already exists', () => {
        const oldDate = 'Date 1'
        const newDate = 'Date 2'

        vi.mocked(getSqlTimestamp).mockReturnValue(oldDate)
        const oldItem = upsertMockItem(1, ItemType.Anime)

        vi.mocked(getSqlTimestamp).mockReturnValue(newDate)
        const newItem = upsertMockItem(1, ItemType.Anime, 'Some URL')

        expect(newItem.id).toBe(oldItem.id)
        expect(newItem.malId).toBe(oldItem.malId)
        expect(newItem.mediaType).toBe(oldItem.mediaType)
        expect(newItem.imgUrl).not.toBeNull()
        expect(newItem.createdAt).toBe(oldDate)
        expect(newItem.updatedAt).toBe(newDate)
        expect(selectItems(dbHandles.db).length).toBe(1)
    })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function upsertMockItem(malId: number, mediaType = ItemType.Anime, imgUrl: string | null = null) {
    return upsertItem(db, {
        mediaType,
        malId,
        imgUrl,
    })
}
