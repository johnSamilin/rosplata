//@ts-check

import { getFromLs, isOverridden } from "../utils/utils.mjs"

const reducedMotionMedia = matchMedia('(prefers-reduced-motion)')
const darkThemeMedia = matchMedia('(prefers-color-scheme: dark)')

class CSettingsManager {
    #appVersion = '0.1.0'
    #battery
    #animationsEnabled = Boolean(getFromLs('animationsEnabled', true))
    #autoLoginEnabled = Boolean(getFromLs('autoLoginEnabled', true))
    #theme = getFromLs('theme', 'system')

    get animationsEnabled() {
        return this.#animationsEnabled
    }

    get appVersion() {
        return this.#appVersion
    }

    set animationsEnabled(value) {
        this.#animationsEnabled = value
        if (!value) {
            document.body.classList.add('no-animations')
        } else {
            document.body.classList.remove('no-animations')
        }
    }

    get autoLoginEnabled() {
        return this.#autoLoginEnabled
    }

    get theme() {
        return this.#theme
    }

    override(name, value) {
        if (!(name in this)) {
            return false
        }
        this[`#${name}`] = value
        localStorage.setItem(name, value)
        switch (name) {
            case 'animationsEnabled':
                if (value) {                    
                    reducedMotionMedia.addEventListener('change', this.#onAnimationDepsChange)
                    this.#battery?.addEventListener('levelchange', this.#onAnimationDepsChange)
                } else {
                    reducedMotionMedia.removeEventListener('change', this.#onAnimationDepsChange)
                    this.#battery?.removeEventListener('levelchange', this.#onAnimationDepsChange)
                }
                this.#onAnimationDepsChange()
                break
            case 'theme':
                if (value === 'system') {
                    darkThemeMedia.addEventListener('change', this.onSystemThemeChange)
                    this.onSystemThemeChange()
                } else {
                    darkThemeMedia.removeEventListener('change', this.onSystemThemeChange)
                    this.#changeTheme(value)
                }
        }
    }

    constructor() {
        if (this.#animationsEnabled) {
            try {
                navigator.getBattery().then(battery => {
                    this.#battery = battery
                    this.#onAnimationDepsChange()
                    reducedMotionMedia.addEventListener('change', this.#onAnimationDepsChange)
                    this.#battery.addEventListener('levelchange', this.#onAnimationDepsChange)
                })
            } catch (er) {
                console.error('Your browser doesn\'t support Battery API. But should!');
            }
        }
        if (this.#theme === 'system') {
            darkThemeMedia.addEventListener('change', this.onSystemThemeChange)
            this.onSystemThemeChange()
        } else {
            this.#changeTheme(this.#theme)
        }
    }

    #onAnimationDepsChange = () => {
        this.#animationsEnabled = !reducedMotionMedia.matches && this.#battery?.level > 0.15
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
}

export const SettingsManager = new CSettingsManager()
