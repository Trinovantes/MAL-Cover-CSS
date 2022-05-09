import { getDbClient } from '@/common/db/client'
import { getSqlTimestamp } from '@/common/utils/getSqlTimestamp'
import type { CreationOmit, DefaultColumns } from './attrs'

// ----------------------------------------------------------------------------
// Item
// ----------------------------------------------------------------------------

export enum MediaType {
    Anime = 'anime',
    Manga = 'manga',
}

export type ItemAttributes = DefaultColumns & {
    malId: number
    mediaType: MediaType
    imgUrl: string | null
}

export class Item {
    static readonly TABLE = 'Items'

    private _attrs: ItemAttributes

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    private constructor(attrs: ItemAttributes) {
        this._attrs = attrs
    }

    static async upsert(attrs: Omit<ItemAttributes, CreationOmit>): Promise<Item> {
        const now = getSqlTimestamp()

        const dbClient = await getDbClient()
        const result = await dbClient.run(`
            INSERT INTO ${Item.TABLE}(mediaType, malId, imgUrl, createdAt, updatedAt) VALUES(@mediaType, @malId, @imgUrl, @createdAt, @updatedAt)
                ON CONFLICT(mediaType, malId) DO UPDATE SET
                    imgUrl    = @imgUrl     ,
                    updatedAt = @updatedAt  ;
        `, {
            '@mediaType': attrs.mediaType,
            '@malId': attrs.malId,
            '@imgUrl': attrs.imgUrl,
            '@createdAt': now,
            '@updatedAt': now,
        })

        if (result.lastID === undefined || result.changes !== 1) {
            throw new Error('Failed to upsert Item')
        }

        const item = await Item.fetch(attrs.mediaType, attrs.malId)
        if (!item) {
            throw new Error('Failed to find upserted Item')
        }

        return item
    }

    static async fetch(mediaType: MediaType, malId: number): Promise<Item | null> {
        const dbClient = await getDbClient()
        const itemAttrs = await dbClient.get<ItemAttributes>(`
            SELECT * FROM ${Item.TABLE}
            WHERE mediaType = @mediaType
            AND   malId     = @malId;
        `, {
            '@mediaType': mediaType,
            '@malId': malId,
        })

        if (!itemAttrs) {
            return null
        }

        return new Item(itemAttrs)
    }

    static async fetchAll(mediaType?: MediaType): Promise<Array<Item>> {
        const dbClient = await getDbClient()
        let rows: Array<ItemAttributes>

        if (mediaType) {
            rows = await dbClient.all<Array<ItemAttributes>>(`
                SELECT * FROM ${Item.TABLE}
                WHERE mediaType = @mediaType;
            `, {
                '@mediaType': mediaType,
            })
        } else {
            rows = await dbClient.all<Array<ItemAttributes>>(`
                SELECT * FROM ${Item.TABLE};
            `)
        }

        return rows.map((row) => new Item(row))
    }

    // ------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------

    get id(): number {
        return this._attrs.id
    }

    get malId(): number {
        return this._attrs.malId
    }

    get mediaType(): MediaType {
        return this._attrs.mediaType
    }

    get imgUrl(): string | null {
        return this._attrs.imgUrl
    }

    get createdAt(): string {
        return this._attrs.createdAt
    }

    get updatedAt(): string {
        return this._attrs.updatedAt
    }
}
