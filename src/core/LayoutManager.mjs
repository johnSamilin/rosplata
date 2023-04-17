//@ts-check

import { Store } from './Store.mjs'

const topContainer = document.querySelector('#layout')

class CLayoutManager {
    #active
    #layout

    constructor() {
        Store.subscribe('layout', this.#onChange)
        Store.subscribe('isMobile', () => this.#onChange(this.#active))
        this.#onChange(Store.get('layout'))
    }

    #onChange = async (newLayout) => {
        if (newLayout === this.#active) {
            this.#layout?.update()
        } else {
            this.#active = newLayout
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
        }

        return layout
    }
}

export const LayoutManager = new CLayoutManager()
