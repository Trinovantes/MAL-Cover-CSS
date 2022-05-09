import { DB_MEMORY, DB_MIGRATIONS_DIR } from '@/common/Constants'
import * as dbClientModule from '@/common/db/client'
import { migrateDb } from '@/common/db/migration'
import { Item, MediaType } from '@/common/models/Item'
import * as getSqlTimestampModule from '@/common/utils/getSqlTimestamp'

// ----------------------------------------------------------------------------
// Global
// ----------------------------------------------------------------------------

let testDbClient: dbClientModule.DbClient

beforeEach(async() => {
    testDbClient = dbClientModule.createDbClient(DB_MEMORY)
    jest.spyOn(dbClientModule, 'getDbClient').mockImplementation(() => testDbClient)

    await migrateDb(true, DB_MIGRATIONS_DIR)
})

afterEach(async() => {
    await migrateDb(false, DB_MIGRATIONS_DIR)

    const db = await testDbClient
    await db.close()

    jest.restoreAllMocks()
})

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('Item', () => {
    test('tables are created', async() => {
        const dbClient = await dbClientModule.getDbClient()
        const tables = await dbClient.all<Array<{ name: string }>>(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table';
        `)

        expect(tables.length).toBeGreaterThan(1)
        expect(tables.findIndex((table) => table.name === Item.TABLE)).not.toBe(-1)
    })

    describe('upsert', () => {
        test('when item does not exist', async() => {
            const item = await upsertItem(42)
            expect(item.id).toBe(1)
        })

        test('when mediaType does not exist', async() => {
            const upsert = async() => await upsertItem(42, 'fake' as MediaType)
            await expect(upsert()).rejects.toThrowError(/SQLITE_CONSTRAINT/)
        })

        test('when item does not exist in non-empty db', async() => {
            for (let malId = 1; malId <= 10; malId++) {
                await upsertItem(malId)
            }

            const item = await upsertItem(11)
            expect(item.id).toBe(11)
        })

        test('when same item id used for anime and manga', async() => {
            await upsertItem(42, MediaType.Anime)
            await upsertItem(42, MediaType.Manga)

            const items = await Item.fetchAll()
            expect(items.length).toBe(2)
        })

        test('when item exists', async() => {
            const initDate = 'fake date'
            jest.spyOn(getSqlTimestampModule, 'getSqlTimestamp').mockImplementation(() => initDate)

            const oldItem = await Item.upsert({
                malId: 1,
                mediaType: MediaType.Anime,
                imgUrl: null,
            })

            const newDate = 'fake date 2'
            jest.spyOn(getSqlTimestampModule, 'getSqlTimestamp').mockImplementation(() => newDate)

            const newItem = await Item.upsert({
                malId: 1,
                mediaType: MediaType.Anime,
                imgUrl: 'new url',
            })

            expect(newItem.id).toBe(oldItem.id)
            expect(newItem.malId).toBe(oldItem.malId)
            expect(newItem.mediaType).toBe(oldItem.mediaType)
            expect(newItem.imgUrl).not.toBeNull()
            expect(newItem.createdAt).toBe(initDate)
            expect(newItem.updatedAt).toBe(newDate)
            expect((await Item.fetchAll()).length).toBe(1)
        })
    })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

async function upsertItem(malId: number, mediaType = MediaType.Anime): Promise<Item> {
    return await Item.upsert({
        malId,
        mediaType,
        imgUrl: '',
    })
}
