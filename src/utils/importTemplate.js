//@ts-check
export async function importTemplate(filepath) {
    let response = await fetch(filepath)
    let txt = await response.text()

    let html = new DOMParser().parseFromString(txt, 'text/html')
    return html
}