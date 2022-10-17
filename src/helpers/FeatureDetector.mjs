//@ts-check

let instance

class CFeatureDetector {
    // @ts-ignore
    #transitionApi = !!document.createDocumentTransition
    #importMaps = HTMLScriptElement.supports && HTMLScriptElement.supports('importmap')

    get transtionApi() {
        return this.#transitionApi;
    }
    get importMaps() {
        return this.#importMaps
    }

    constructor() {
        if (instance) {
            return instance
        }
        instance = this
    }

    [Symbol.iterator] = function *() {
        yield *[
            ['transitionApi', this.#transitionApi],
            ['importMaps', this.#importMaps],
        ];
    }
}

export const FeatureDetector = new CFeatureDetector()
