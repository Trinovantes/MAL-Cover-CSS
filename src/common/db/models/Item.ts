import { type InferSelectModel, sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { getSqlTimestamp } from '../../utils/getSqlTimestamp.ts'
import type { DrizzleClient } from '../createDb.ts'
import type { ItemType } from './ItemType.ts'

export const itemTable = sqliteTable('Item', {
    id: integer('id').primaryKey(),

    mediaType: text('mediaType').$type<ItemType>().notNull(),
    malId: integer('malId').notNull(),
    imgUrl: text('imgUrl'),

    createdAt: text('createdAt').notNull(),
    updatedAt: text('updatedAt').notNull(),
})

export type Item = InferSelectModel<typeof itemTable>

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function upsertItem(db: DrizzleClient, payload: Pick<Item, 'mediaType' | 'malId' | 'imgUrl'>): Item {
    const now = getSqlTimestamp()

    return db
        .insert(itemTable)
        .values({
            ...payload,
            createdAt: now,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: [itemTable.mediaType, itemTable.malId],
            set: {
                imgUrl: payload.imgUrl,
                updatedAt: now,
            },
        })
        .returning()
        .get()
}

export function selectItems(db: DrizzleClient, mediaType?: ItemType): Array<Item> {
    if (mediaType === undefined) {
        return db
            .select()
            .from(itemTable)
            .all()
    } else {
        return db
            .select()
            .from(itemTable)
            .where(sql`${itemTable.mediaType} = ${mediaType}`)
            .all()
    }
}
