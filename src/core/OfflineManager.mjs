//@ts-check

import { SettingsManager } from './SettingsManager.mjs'

class COfflineManager {
    async start() {
        try {
            if (SettingsManager.offlineModeEnabled) {
                const url = '/service-worker.js'
                let registration = await navigator.serviceWorker.getRegistration(url)
                let latestVersion
                let shouldUpdateCache = true
                try {
                    latestVersion = await (await fetch('/version')).json()
                    shouldUpdateCache = SettingsManager.appVersion !== latestVersion.version
                    registration?.addEventListener('updatefound', event => {
                        const newSW = registration?.installing;
                        newSW?.addEventListener('statechange', event => {
                            if (newSW.state == 'installed') {
                                if (confirm('Would you like to update the app?')) {
                                    registration?.unregister()
                                }
                            }
                        })
                        navigator.serviceWorker.addEventListener('controllerchange', async event => {
                            const { Alert } = await import('../components/Alert/Alert.mjs')
                            new Alert('success', 'Rosplata successfully updated. Enjoy!')
                        })
                    })
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
        }
    }
}

export const OfflineManager = new COfflineManager()
