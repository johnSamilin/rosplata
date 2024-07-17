//@ts-check

import { Store } from './Store.mjs'

const topContainer = document.querySelector('#layout')

class CLayoutManager {
    activeLayout
    #layout

    constructor() {
        Store.subscribe('layout', this.#onChange)
        Store.subscribe('isMobile', () => this.#onChange(this.activeLayout))
        this.#onChange(Store.get('layout'))
    }

    #onChange = async (newLayout) => {
        if (newLayout === this.activeLayout) {
            this.#layout?.update()
        } else {
            this.activeLayout = newLayout
            await this.#layout?.exterminate()
            topContainer?.classList.add('loading')
            this.#layout = await this.#getLayout(newLayout)
            this.#layout?.renderTo(topContainer)
            topContainer?.classList.remove('loading')
        }
    }

    async #getLayout(name) {
        let layout
        switch (name) {
            case 'main':
                const { MainLayout } = await import('../layouts/Main/MainLayout.mjs')
                layout = new MainLayout()
                break
            case 'settings':
                const { SettingsLayout } = await import('../layouts/Settings/SettingsLayout.mjs')
                layout = new SettingsLayout()
                break
            case 'login':
                const { LoginLayout } = await import('../layouts/Login/LoginLayout.mjs')
                layout = new LoginLayout()
                break
            case 'uikit':
                const { UikitLayout } = await import('../layouts/Uikit/UikitLayout.mjs')
                layout = new UikitLayout()
                break
        }

        return layout
    }
}

export const LayoutManager = new CLayoutManager()
