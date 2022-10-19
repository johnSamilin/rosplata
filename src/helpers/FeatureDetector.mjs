//@ts-check

let instance

class CFeatureDetector {
    // @ts-ignore
    #transitionApi = !!document.createDocumentTransition
    #importMaps = HTMLScriptElement.supports && HTMLScriptElement.supports('importmap')
    #connectionSpeed = navigator.connection.effectiveType

    get transtionApi() {
        return this.#transitionApi;
    }
    get importMaps() {
        return this.#importMaps
    }
    get connectionSpeed() {
        return this.#connectionSpeed
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
    }



    [Symbol.iterator] = function *() {
        yield *[
            ['Transition Api', this.#transitionApi],
            ['Import Maps', this.#importMaps],
            ['Connection Speed Estimation', this.#connectionSpeed]
        ];
    }
}

export const FeatureDetector = new CFeatureDetector()
