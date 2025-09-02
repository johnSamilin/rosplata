//@ts-check

import { Store } from '../../shared/lib/store'

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
                const { MainPage } = await import('../../pages/main')
                layout = new MainPage()
                break
            case 'settings':
                const { SettingsPage } = await import('../../pages/settings')
                layout = new SettingsPage()
                break
            case 'login':
                const { LoginPage } = await import('../../pages/login')
                layout = new LoginPage()
                break
        }

        return layout
    }
}

export const LayoutManager = new CLayoutManager()