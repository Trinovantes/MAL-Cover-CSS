import fs from 'node:fs'
import path from 'node:path'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import { SENTRY_DSN } from '@/common/Constants'
import { Item, selectItems } from '@/common/db/models/Item'
import { DrizzleClient } from '@/common/db/createDb'
import { ItemType } from '@/common/db/models/ItemType'
import { createLogger } from '@/common/node/createLogger'
import { initDb } from '@/common/db/initDb'

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
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    enabled: !DEFINE.IS_DEV,
})

// ----------------------------------------------------------------------------
// Generator
// ----------------------------------------------------------------------------

enum CssSelector {
    Self = 'self',
    Before = 'before',
    After = 'after',
    More = 'more',
}

function generateCss(db: DrizzleClient, outputDir: string) {
    logger.info(`Starting to generate css into ${outputDir}`)

    const selectors = Object.values(CssSelector)
    const mediaTypes = [...Object.values(ItemType), undefined]
    const combosToGenerate = crossProduct(selectors, mediaTypes)

    for (const combo of combosToGenerate) {
        generate(db, outputDir, combo[0], combo[1])
    }
}

function generate(db: DrizzleClient, outputDir: string, selector: CssSelector, mediaType?: ItemType) {
    if (mediaType === undefined && selector === CssSelector.More) {
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
        case CssSelector.More:
            cssRule += `#more${item.malId}`
            break

        case CssSelector.Self:
            cssRule += '.animetitle'
            cssRule += `[href^="/${item.mediaType}/${item.malId}/"]`
            break

        case CssSelector.Before:
        case CssSelector.After:
            cssRule += '.animetitle'
            cssRule += `[href^="/${item.mediaType}/${item.malId}/"]:${selector}`
            break
    }

    cssRule += `{background-image:url(${item.imgUrl});}\n`

    return cssRule
}

function crossProduct<A, B>(aList: Array<A>, bList: Array<B>): Array<[A, B]> {
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

    const transaction = Sentry.startTransaction({
        op: 'generateCss',
        name: 'Generate CSS Cron Job',
    })

    try {
        const db = await initDb(logger)
        generateCss(db, outputDir)
    } catch (err) {
        logger.error(err)
        Sentry.captureException(err)
    }

    transaction.finish()
}

main().catch((err: unknown) => {
    logger.error(err)
    process.exit(1)
})
