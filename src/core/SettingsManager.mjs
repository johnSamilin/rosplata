//@ts-check

const reducedMotionMedia = matchMedia('(prefers-reduced-motion)')

class CSettingsManager {
    #battery
    #animationsOverridden = false
    #animationsEnabled = true

    get animationsEnabled() {
        return this.#animationsEnabled
    }

    set animationsEnabled(value) {
        this.#animationsEnabled = value
        if (!value) {
            document.body.classList.add('no-animations')
        } else {
            document.body.classList.remove('no-animations')
        }
    }

    set animationsOverridden(value) {
        reducedMotionMedia.removeEventListener('change', this.#onAnimationDepsChange)
        this.#battery.removeEventListener('levelchange', this.#onAnimationDepsChange)
    }

    constructor() {
        navigator.getBattery().then(battery => {
            this.#battery = battery
            this.#onAnimationDepsChange()
            reducedMotionMedia.addEventListener('change', this.#onAnimationDepsChange)
            this.#battery.addEventListener('levelchange', this.#onAnimationDepsChange)
        })
    }

    #onAnimationDepsChange = () => {
        this.#animationsEnabled = !reducedMotionMedia.matches && this.#battery.level > 0.15
    }

}

export const SettingsManager = new CSettingsManager()
