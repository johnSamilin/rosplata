// @ts-check
import { LayoutManager } from "./core/LayoutManager.mjs"
import { Router } from "./core/Router.mjs"
import { importStyle } from "./utils/imports.js"

importStyle('/styles/App.css')

document.body.addEventListener('click', async (event) => {
    if (event.target.tagName === 'A') {
        event.preventDefault()
        event.stopImmediatePropagation()
        Router.navigate(event.target.getAttribute('href'))
    }
})