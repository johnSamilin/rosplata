//@ts-check

import { BASE_URL } from "../constants/routes.mjs"

const importedTemplates = new Set()

export async function importTemplate(filepath) {
    if (importedTemplates.has(BASE_URL + filepath)) {
        return true
    }
    let response = await fetch(BASE_URL + filepath)
    let txt = await response.text()

    const template = document.createElement('template')
    document.head.appendChild(template)
    template.outerHTML = txt
    importedTemplates.add(BASE_URL + filepath)
    return true
}

export function importStyle(filepath) {
    //@ts-ignore
    import(BASE_URL + filepath, { assert: { type: 'css' } }).then(Styles => {
        document.adoptedStyleSheets.push(Styles.default)
    })
}
