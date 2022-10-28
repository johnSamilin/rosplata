import { BASE_URL } from "../constants/routes.mjs"

//@ts-check
export async function importTemplate(filepath) {
    let response = await fetch(filepath)
    let txt = await response.text()

    let html = new DOMParser().parseFromString(txt, 'text/html')
    return html
}

export function importStyle(filepath) {
    //@ts-ignore
    import(BASE_URL + filepath, { assert: { type: 'css' } }).then(Styles => {
        document.adoptedStyleSheets.push(Styles.default)
    })
}
