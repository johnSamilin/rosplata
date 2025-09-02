// @ts-check
import { AuthManager } from "../shared/lib/auth"
import { Router } from "../shared/lib/router"
import { importStyle } from "../shared/lib/imports"

importStyle('/src/app/styles/index.css')

document.querySelector('#features-support-checkup')?.remove()

document.body.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && !event.target.hasAttribute('target')) {
        event.preventDefault()
        event.stopImmediatePropagation()
        let didgoback = true
        if ('goback' in event.target.dataset) {
            didgoback = Router.back()
            if (didgoback) {
                return
            }
        }
        Router.navigate(event.target.getAttribute('href'), !didgoback)
    }
})

window.addEventListener('load', async () => {
    await AuthManager.start()
    if (location.pathname === '/demo') {
        AuthManager.requestDemoAccess()
    }
    if (await AuthManager.validate()) {
        Router.start()
    }
})

const errorHandler = (error) => {
    import('../shared/lib/crisis-manager').then(({ CrisisManager }) => {
        CrisisManager.logError(error)
    })
}

window.onerror = (event, source, line, col, error) => errorHandler(error)
window.addEventListener('error', (event) => {
    errorHandler(event.error)
})