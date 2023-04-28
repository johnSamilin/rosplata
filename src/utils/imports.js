import { BASE_URL } from "../constants/routes.mjs"
import { FeatureDetector } from "../core/FeatureDetector.mjs"

//@ts-check
export async function importTemplate(filepath) {
    let response = await fetch(filepath)
    let txt = await response.text()

    let html = new DOMParser().parseFromString(txt, 'text/html')
    return html
}

const adoptedStyleSheets = new Set()
export async function importStyle(filepath) {
    if (adoptedStyleSheets.has(filepath)) {
        return
    }
    const { importStyle: importer } = FeatureDetector.importAssertions
        ? await import("./polyfills/importAssert.mjs")
        : await import("./polyfills/importLegacy.mjs")

    adoptedStyleSheets.add(filepath)
    return importer(BASE_URL + filepath)
}
