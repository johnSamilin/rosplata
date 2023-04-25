export function importStyle(filepath) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('async', true)
    link.setAttribute('href', filepath)
    document.head.appendChild(link)
}
