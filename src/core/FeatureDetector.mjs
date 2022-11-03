//@ts-check

import { Store } from "./Store.mjs"

let instance

const mobileMediaQuery = window.matchMedia('(max-width: 425px)')

class CFeatureDetector {
    // @ts-ignore
    #transitionApi = !!document.createDocumentTransition
    #importMaps = HTMLScriptElement.supports && HTMLScriptElement.supports('importmap')
    #connectionSpeed = navigator.connection.effectiveType
    #URLPattern = 'URLPattern' in window
    #isMobile = mobileMediaQuery.matches

    get transtionApi() {
        return this.#transitionApi;
    }
    get importMaps() {
        return this.#importMaps
    }
    get connectionSpeed() {
        return this.#connectionSpeed
    }
    get URLPattern() {
        return this.#URLPattern
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
            ['Transition Api', this.#transitionApi],
            ['Import Maps', this.#importMaps],
            ['Connection Speed Estimation', this.#connectionSpeed],
            ['URL pattern matching', this.#URLPattern],
        ];
    }
}

export const FeatureDetector = new CFeatureDetector()
