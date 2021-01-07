import path from 'path'
import fs from 'fs'

import { Item, MediaType } from '@common/models/Item'
import { logger } from '@common/utils/logger'

// ----------------------------------------------------------------------------
// Generator
// ----------------------------------------------------------------------------

enum CssSelector {
    Self = 'self',
    Before = 'before',
    After = 'after',
    More = 'more',
}

async function generateCSS() {
    if (process.argv.length !== 3) {
        throw new Error('Missing outputDir in argv')
    }

    const outputDir = path.resolve(process.argv[2])
    logger.info(`Starting to generate css into ${outputDir}`)

    const selectors = Object.values(CssSelector)
    const mediaTypes = [...Object.values(MediaType), null]
    const comboToGenerate = crossProduct(selectors, mediaTypes)

    for (const combo of comboToGenerate) {
        await generate(outputDir, combo[0], combo[1])
    }
}

async function generate(outputDir: string, selector: CssSelector, mediaType: MediaType | null) {
    if (!mediaType && selector === CssSelector.More) {
        // The '#more[mal id]' selector is based on MAL's id which is not unique for both manga and anime
        // i.e. different manga/anime can share the same id
        return
    }

    const fileName = `${!mediaType ? 'all' : mediaType}-${selector}.css`
    const outputFile = path.resolve(outputDir, fileName)
    const cssFileStream = fs.createWriteStream(outputFile, { flags: 'w' })

    logger.info(`Starting to write ${fileName}`)
    cssFileStream.on('error', (error) => {
        logger.warn('Failed to write %s (%s:%s)', fileName, error.name, error.message)
        logger.debug(error.stack)
    })

    const items = mediaType
        ? await Item.findAll({ where: { mediaType: mediaType } })
        : await Item.findAll()

    for (const item of items) {
        const cssRule = getCssRule(selector, item)
        cssFileStream.write(cssRule)
    }

    logger.info('Finished writing', fileName)
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
    await generateCSS()
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((err) => {
        logger.error(err)
        process.exit(1)
    })
