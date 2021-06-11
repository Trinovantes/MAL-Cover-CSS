import path from 'path'
import fs from 'fs'
import { Item, MediaType } from '@/common/models/Item'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import { SENTRY_DSN } from '@/common/Constants'
import '@/common/utils/setupDayjs'

// ----------------------------------------------------------------------------
// Sentry
// ----------------------------------------------------------------------------

Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
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

async function generateCss() {
    if (process.argv.length !== 3) {
        throw new Error('Missing outputDir in argv')
    }

    const outputDir = path.resolve(process.argv[2])
    if (!fs.existsSync(outputDir)) {
        console.warn(`outputDir ${outputDir} does not exist`)
        return
    }

    console.info(`Starting to generate css into ${outputDir}`)
    const transaction = Sentry.startTransaction({
        op: 'generateCss',
        name: 'Generate CSS Cron Job',
    })

    const selectors = Object.values(CssSelector)
    const mediaTypes = [...Object.values(MediaType), undefined]
    const comboToGenerate = crossProduct(selectors, mediaTypes)

    for (const combo of comboToGenerate) {
        try {
            const child = transaction.startChild({ op: 'generate', description: `generate(${outputDir}, ${combo[0]}, ${combo[1]})` })
            await generate(outputDir, combo[0], combo[1])
            child.finish()
        } catch (err) {
            console.warn('Failed to generate', comboToGenerate)
            console.warn(err)
            Sentry.captureException(err)
        }
    }

    transaction.finish()
}

async function generate(outputDir: string, selector: CssSelector, mediaType?: MediaType) {
    if (mediaType === undefined && selector === CssSelector.More) {
        // The '#more[mal id]' selector is based on MAL's id which is not unique for both manga and anime
        // i.e. different manga/anime can share the same id
        return
    }

    const fileName = `${!mediaType ? 'all' : mediaType}-${selector}.css`
    const outputFile = path.resolve(outputDir, fileName)
    console.info(`Starting to write: ${outputFile}`)

    const cssFileStream = fs.createWriteStream(outputFile, { flags: 'w' })
    cssFileStream.on('error', (error) => {
        console.warn('Failed to write css file', fileName)
        console.warn(error)
    })

    const items = await Item.fetchAll(mediaType)
    for (const item of items) {
        const cssRule = getCssRule(selector, item)
        cssFileStream.write(cssRule)
    }

    console.info(`Finished writing ${outputFile}`)
    cssFileStream.end()
}

function getCssRule(selector: CssSelector, item: Item) {
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
    await generateCss()
}

main().catch((err) => {
    console.warn(err)
    process.exit(1)
})
