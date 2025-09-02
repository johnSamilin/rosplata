import { BASE_URL } from "../config/routes"
import { FeatureDetector } from "./feature-detector"

//@ts-check
export async function importTemplate(filepath) {
    let response = await fetch(filepath)
    let txt = await response.text()

    let html = new DOMParser().parseFromString(txt, 'text/html')
    return html
}

const adoptedStyleSheets = new Set()

async function importLegacy(filepath) {
    const { importStyle: legacyImporter } = await import("./polyfills/import-legacy")
    console.log('Failed to use CSS modules. Fallback to legacy approach')
    await legacyImporter(BASE_URL + filepath)
}

export async function importStyle(filepath) {
    if (adoptedStyleSheets.has(filepath)) {
        return
    }

    let importer
    if (!FeatureDetector.importAssertions) {
        importer = importLegacy
    } else {
       const { importStyle: assert } = await import("./polyfills/import-assert")
       importer = assert
    }

    adoptedStyleSheets.add(filepath)
    await importer(BASE_URL + filepath).catch(() => importLegacy(filepath))
}