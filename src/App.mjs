// @ts-check
import { AuthManager } from "./core/AuthManager.mjs"
import { LayoutManager } from "./core/LayoutManager.mjs"
import { Router } from "./core/Router.mjs"
import { SettingsManager } from "./core/SettingsManager.mjs"
import { importStyle } from "./utils/imports.js"

importStyle('/styles/App.css')

if (SettingsManager.offlineMode) {
    console.log('We\'re in offline mode')
}

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
    try {
        if (SettingsManager.offlineModeEnabled) {
            const url = '/service-worker.js'
            let registration = await navigator.serviceWorker.getRegistration(url)
            let latestVersion
            let shouldUpdateCache = true
            try {
                latestVersion = await (await fetch('/version')).json()
                shouldUpdateCache = SettingsManager.appVersion !== latestVersion.version
            } catch (er) {
                console.error('Skipping cache update', er)
                shouldUpdateCache = false
            }
            if (!registration) {
                registration = await navigator.serviceWorker.register(
                    url,
                    { type: 'module', updateViaCache: 'all' }
                )
            }

            registration.active?.postMessage({ shouldUpdateCache })
        }
    } catch (er) {
        console.error(er)
        SettingsManager.offlineModeEnabled = false
    } finally {
        await AuthManager.start()
        if (location.pathname === '/demo') {
            AuthManager.requestDemoAccess()
        }
        if (await AuthManager.validate()) {
            Router.start()
        }
    }
})

const errorHandler = (error) => {
    import('./src/core/CrisisManager.mjs').then(({ CrisisManager }) => {
        CrisisManager.logError(error)
    })
}

window.onerror = (event, source, line, col, error) => errorHandler(error)
window.addEventListener('error', (event) => {
    errorHandler(event.error)
})

