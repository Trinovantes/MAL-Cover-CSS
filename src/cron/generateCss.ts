import fs from 'node:fs'
import path from 'node:path'
import { Item, selectItems } from '@/common/db/models/Item'
import { createDb, DrizzleClient } from '@/common/db/createDb'
import { ALL_ITEM_TYPES, ItemType } from '@/common/db/models/ItemType'
import { createLogger } from '@/common/node/createLogger'
import * as Sentry from '@sentry/node'
import { DB_FILE, SENTRY_DSN } from '@/common/Constants'
import { getMigrations } from '@/common/db/getMigrations'

// ----------------------------------------------------------------------------
// Pino
// ----------------------------------------------------------------------------

const logger = createLogger()

// ----------------------------------------------------------------------------
// Sentry
// ----------------------------------------------------------------------------

Sentry.init({
    dsn: SENTRY_DSN,
    release: DEFINE.GIT_HASH,
    enabled: !DEFINE.IS_DEV,
})

// ----------------------------------------------------------------------------
// Generator
// ----------------------------------------------------------------------------

const ALL_CSS_SELECTORS = [
    'self',
    'before',
    'after',
    'more',
] as const

type CssSelector = typeof ALL_CSS_SELECTORS[number]

function generateCss(db: DrizzleClient, outputDir: string) {
    logger.info(`Starting to generate css into ${outputDir}`)

    const combosToGenerate = crossProduct(ALL_CSS_SELECTORS, [...ALL_ITEM_TYPES, undefined])
    for (const combo of combosToGenerate) {
        generate(db, outputDir, combo[0], combo[1])
    }
}

function generate(db: DrizzleClient, outputDir: string, selector: CssSelector, mediaType?: ItemType) {
    if (mediaType === undefined && selector === 'more') {
        // The '#more[mal id]' selector is based on MAL's id which is not unique for both manga and anime
        // i.e. different manga/anime can share the same id
        return
    }

    const fileName = `${mediaType === undefined ? 'all' : mediaType}-${selector}.css`
    const outputFile = path.resolve(outputDir, fileName)
    const cssFileStream = fs.createWriteStream(outputFile, { flags: 'w' })
    cssFileStream.on('error', (err) => {
        logger.warn('Failed to write css file', fileName)
        logger.warn(err)
    })

    const items = selectItems(db, mediaType)
    for (const item of items) {
        const cssRule = getCssRule(selector, item)
        cssFileStream.write(cssRule)
    }

    logger.info(`Finished writing ${outputFile}`)
    cssFileStream.end()
}

function getCssRule(selector: CssSelector, item: Item): string {
    if (!item.imgUrl) {
        return ''
    }

    let cssRule = ''

    switch (selector) {
        case 'more':
            cssRule += `#more${item.malId}`
            break

        case 'self':
            cssRule += '.animetitle'
            cssRule += `[href^="/${item.mediaType}/${item.malId}/"]`
            break

        case 'before':
        case 'after':
            cssRule += '.animetitle'
            cssRule += `[href^="/${item.mediaType}/${item.malId}/"]:${selector}`
            break
    }

    cssRule += `{background-image:url(${item.imgUrl});}\n`

    return cssRule
}

function crossProduct<A, B>(aList: ReadonlyArray<A>, bList: ReadonlyArray<B>): Array<[A, B]> {
    const product: Array<[A, B]> = []

    for (const a of aList) {
        for (const b of bList) {
            product.push([a, b])
        }
    }

    return product
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
    if (process.argv.length !== 3) {
        throw new Error('Missing outputDir in argv')
    }

    const outputDir = path.resolve(process.argv[2])
    if (!fs.existsSync(outputDir)) {
        throw new Error(`outputDir:${outputDir} does not exist`)
    }

    await Sentry.startSpan({
        op: 'generateCss',
        name: 'Generate CSS Cron Job',
    }, async() => {
        try {
            const db = await createDb(DB_FILE, {
                cleanOnExit: true,
                migrations: await getMigrations(),
            })

            generateCss(db, outputDir)
        } catch (err) {
            logger.error(err)
            Sentry.captureException(err)
        }
    })
}

main().catch((err: unknown) => {
    logger.error(err)
    process.exit(1)
})
