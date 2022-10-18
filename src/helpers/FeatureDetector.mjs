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
            ['Transition Api', this.#transitionApi],
            ['Import Maps', this.#importMaps],
        ];
    }
}

export const FeatureDetector = new CFeatureDetector()
