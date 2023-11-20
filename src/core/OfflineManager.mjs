//@ts-check

import { SettingsManager } from './SettingsManager.mjs'

class COfflineManager {
    #reg
    #shouldUpdate = true
    #url = '/service-worker.js'

    async start() {
        try {
            if (SettingsManager.offlineModeEnabled) {
                this.#reg = await navigator.serviceWorker.getRegistration(this.#url)
                this.#watchUpdate()
                if (!this.#reg) {
                    this.#reg = await navigator.serviceWorker.register(
                        this.#url,
                        { type: 'module', updateViaCache: 'all' }
                    )
                } else {
                    try {
                        const latestVersion = await (await fetch('/version')).json()
                        this.#shouldUpdate = SettingsManager.appVersion !== latestVersion.version
                    } catch (er) {
                        console.error('Skipping cache update', er)
                        this.#shouldUpdate = false
                    }
                    this.#reg.active?.postMessage({ shouldUpdateCache: this.#shouldUpdate })
                }

            } else {
                // remove all existing registrations if feature is somehow turned off
                const registrations = await navigator.serviceWorker.getRegistrations()
                registrations.forEach((reg) => {
                    reg.unregister()
                })

            }
        } catch (er) {
            console.error(er)
            SettingsManager.offlineModeEnabled = false
        }
    }

    #watchUpdate() {
        this.#reg?.addEventListener('updatefound', event => {
            const newSW = this.#reg?.installing;
            this.#shouldUpdate = false
            newSW?.addEventListener('statechange', event => {
                if (newSW.state == 'installed') {
                    if (confirm('Would you like to update the app?')) {
                        this.#reg?.unregister()
                    }
                }
            })
            navigator.serviceWorker.addEventListener('controllerchange', async event => {
                const { Alert } = await import('../components/Alert/Alert.mjs')
                new Alert('success', 'Rosplata successfully updated. Enjoy!')
            })
        })
    }
}

export const OfflineManager = new COfflineManager()
