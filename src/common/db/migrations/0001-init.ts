import { sql } from 'drizzle-orm'
import type { Migration } from '../migrateDb.ts'

const migration: Migration = {
    version: '0001' as const,

    run: (transaction) => {
        transaction.run(sql`
            CREATE TABLE 'Users' (
                'id'            INTEGER         NOT NULL,
                'malUsername'   TEXT            NOT NULL,
                'malUserId'     INTEGER         NOT NULL UNIQUE,
                'lastChecked'   DATETIME,
                'tokenExpires'  DATETIME,
                'accessToken'   TEXT,
                'refreshToken'  TEXT,
                'createdAt'     DATETIME        NOT NULL,
                'updatedAt'     DATETIME        NOT NULL,

                PRIMARY KEY ('id')
            )
        `)

        transaction.run(sql`
            CREATE TABLE 'ItemType' (
                'itemType'      VARCHAR(10)     NOT NULL,
                'sequence'      INTEGER         NOT NULL,

                PRIMARY KEY ('itemType')
            )
        `)

        transaction.run(sql`INSERT INTO ItemType(itemType, sequence) VALUES ('anime', 1)`)
        transaction.run(sql`INSERT INTO ItemType(itemType, sequence) VALUES ('manga', 2)`)

        transaction.run(sql`
            CREATE TABLE 'Items' (
                'id'            INTEGER         NOT NULL,
                'mediaType'     TEXT            NOT NULL REFERENCES ItemType(itemType),
                'malId'         INTEGER         NOT NULL,
                'imgUrl'        TEXT,
                'createdAt'     DATETIME        NOT NULL,
                'updatedAt'     DATETIME        NOT NULL,

                PRIMARY KEY ('id'),
                CONSTRAINT unique_item UNIQUE ('mediaType', 'malId')
            )
        `)
    },
}

export default migration
