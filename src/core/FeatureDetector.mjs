//@ts-check

import { Store } from "./Store.mjs"

let instance

const mobileMediaQuery = window.matchMedia('(max-width: 425px)')

class CFeatureDetector {
    #connectionSpeed = navigator.connection.effectiveType
    #isMobile = mobileMediaQuery.matches

    get connectionSpeed() {
        return this.#connectionSpeed
    }
    get isMobile() {
        return this.#isMobile
    }

    updateNetworkInformation = () => {
        this.#connectionSpeed = navigator.connection.effectiveType
    }

    constructor() {
        if (instance) {
            return instance
        }
        instance = this
        console.group(...this)
        console.groupEnd()
        navigator.connection.addEventListener('change', this.updateNetworkInformation)
        mobileMediaQuery.addEventListener('change', this.#updateIsMobile)
    }

    #updateIsMobile = (evt) => {
        this.#isMobile = evt.matches
        Store.set('isMobile', this.#isMobile)
    }

    [Symbol.iterator] = function *() {
        yield *[
            ['Connection Speed Estimation', this.#connectionSpeed],
        ];
    }
}

export const FeatureDetector = new CFeatureDetector()
