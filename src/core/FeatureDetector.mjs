//@ts-check

import { Store } from "./Store.mjs"

let instance

const mobileMediaQuery = window.matchMedia('(max-width: 425px)')

class CFeatureDetector {
    #connectionSpeed = navigator.connection?.effectiveType
    #UrlPattern = 'URLPattern' in window
    #importAssertions = false
    #isMobile = mobileMediaQuery.matches
    #share = 'canShare' in navigator

    get connectionSpeed() {
        return this.#connectionSpeed
    }
    get isMobile() {
        return this.#isMobile
    }
    get UrlPattern() {
        return this.#UrlPattern
    }
    get importAssertions() {
        return this.#importAssertions
    }
    get share() {
        return this.#share
    }

    updateNetworkInformation = () => {
        this.#connectionSpeed = navigator.connection.effectiveType
    }

    constructor() {
        if (instance) {
            return instance
        }
        try {
            eval('import("/styles/", { assert: { type: "css" } })')
            this.#importAssertions = true
        } catch (er) {
            this.#importAssertions = false
        }
        instance = this
        console.group(...this)
        console.groupEnd()
        navigator.connection?.addEventListener('change', this.updateNetworkInformation)
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
