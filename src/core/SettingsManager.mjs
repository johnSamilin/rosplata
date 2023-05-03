//@ts-check

import { getFromLs, updateCurrencyFormatters } from "../utils/utils.mjs"

const darkThemeMedia = matchMedia('(prefers-color-scheme: dark)')

class CSettingsManager {
    #appVersion = '0.2.3'
    #animationsEnabled = true
    #autoLoginEnabled = getFromLs('autoLoginEnabled', 'true') === 'true'
    #theme = getFromLs('theme', 'system')
    #language = getFromLs('language')

    get animationsEnabled() {
        return this.#animationsEnabled
    }
    
    get appVersion() {
        return this.#appVersion
    }

    get autoLoginEnabled() {
        return this.#autoLoginEnabled
    }

    get theme() {
        return this.#theme
    }

    get language() {
        return this.#language
    }

    set language(val) {
        this.#language = val
        updateCurrencyFormatters(Intl.getCanonicalLocales(val))   
    }

    async override(name, value) {
        if (!(name in this)) {
            return false
        }
        this[`#${name}`] = value
        localStorage.setItem(name, value)
        switch (name) {
            case 'theme':
                if (value === 'system') {
                    darkThemeMedia.addEventListener('change', this.onSystemThemeChange)
                    this.onSystemThemeChange()
                } else {
                    darkThemeMedia.removeEventListener('change', this.onSystemThemeChange)
                    this.#changeTheme(value)
                }
            break;
            case 'language':
                const { RequestManager } = await import('./RequestManager.mjs')
                const api = new RequestManager('users')
                await api.post('changeLang', `users/lang/${value}`)
                window.location.reload()
            break;
        }
    }

    constructor() {
        if (this.#theme === 'system') {
            darkThemeMedia.addEventListener('change', this.onSystemThemeChange)
            this.onSystemThemeChange()
        } else {
            this.#changeTheme(this.#theme)
        }
        updateCurrencyFormatters(Intl.getCanonicalLocales(this.#language))  
    }

    onSystemThemeChange = () => {
        this.#changeTheme(darkThemeMedia.matches ? 'dark' : 'light')
    }

    #changeTheme = (theme) => {
        if (theme === 'dark') {
            document.querySelector('html')?.classList.add('dark')
            document.querySelector('html')?.classList.remove('theme-selected')
        } else {
            document.querySelector('html')?.classList.remove('dark')
            document.querySelector('html')?.classList.add('theme-selected')            
        }
    }

    reset() {
        localStorage.clear()
    }
}

export const SettingsManager = new CSettingsManager()
