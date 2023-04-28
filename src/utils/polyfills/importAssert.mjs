export function importStyle(filepath) {
    //@ts-ignore
    import(filepath, { assert: { type: 'css' } }).then(Styles => {
        document.adoptedStyleSheets.push(Styles.default)
    })
}