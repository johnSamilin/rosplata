//@ts-check

import { getFromLs, isOverridden } from "../utils/utils.mjs"

const reducedMotionMedia = matchMedia('(prefers-reduced-motion)')

class CSettingsManager {
    #appVersion = '0.0.4'
    #battery
    #animationsEnabled = getFromLs('animationsEnabled')
    #autoLoginEnabled = getFromLs('autoLoginEnabled')

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

    override(name, value) {
        if (!(name in this)) {
            return false
        }
        this[`#${name}`] = value
        localStorage.setItem(name, value)
        switch (name) {
            case 'animationsEnabled':
                reducedMotionMedia.removeEventListener('change', this.#onAnimationDepsChange)
                this.#battery.removeEventListener('levelchange', this.#onAnimationDepsChange)
                break
        }
    }

    constructor() {
        if (!isOverridden('animationsEnabled')) {
            navigator.getBattery().then(battery => {
                this.#battery = battery
                this.#onAnimationDepsChange()
                reducedMotionMedia.addEventListener('change', this.#onAnimationDepsChange)
                this.#battery.addEventListener('levelchange', this.#onAnimationDepsChange)
            })
        }
    }

    #onAnimationDepsChange = () => {
        this.#animationsEnabled = !reducedMotionMedia.matches && this.#battery.level > 0.15
    }

}

export const SettingsManager = new CSettingsManager()
