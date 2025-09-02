export function importStyle(filepath) {
    //@ts-ignore
    return import(filepath, { assert: { type: 'css' } }).then(Styles => {
        document.adoptedStyleSheets.push(Styles.default)
    })
}