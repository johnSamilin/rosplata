//@ts-check

import { Store } from "./Store.mjs"

let instance

const mobileMediaQuery = window.matchMedia('(max-width: 425px)')

class CFeatureDetector {
    #connectionSpeed = navigator.connection.effectiveType
    #URLPattern = 'URLPattern' in window
    #isMobile = mobileMediaQuery.matches
    #federatedLogin = navigator.credentials && 'FederatedCredential' in window

    get connectionSpeed() {
        return this.#connectionSpeed
    }
    get URLPattern() {
        return this.#URLPattern
    }
    get isMobile() {
        return this.#isMobile
    }
    get federatedLogin() {
        return this.#federatedLogin
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
            ['URL pattern matching', this.#URLPattern],
            ['WebAuthn: federated login', this.#federatedLogin],
        ];
    }
}

export const FeatureDetector = new CFeatureDetector()
