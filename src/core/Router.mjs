//@ts-check

import { BASE_URL, ROUTES } from "../constants/routes.mjs"
import { Store } from "./Store.mjs"

class CRouter {
    #currentRoute
    #routeParams
    #queryParams
    #hash
    #routeMatchers = []

    get currentRoute() {
        return this.#currentRoute
    }

    get routeParams() {
        return this.#routeParams
    }

    get queryParams() {
        return this.#queryParams
    }

    get hash() {
        return this.#hash
    }

    constructor() {
        window.onpopstate = this.#onRouteChange
        const origin = location.origin
        this.#routeMatchers = ROUTES.map(matcher => ({
            ...matcher,
            pattern: new URLPattern({ pathname: matcher.pattern, baseUrl: origin })
        }))
        this.#onRouteChange()
    }

    #onRouteChange = () => {
        const activeLayout = this.#routeMatchers.find(({ pattern }) => pattern.test(location.href))
        if (!activeLayout) {
            console.error('Suitable layout not found');
            return false
        }
        this.#currentRoute = location.pathname
        this.#queryParams = location.search.replace('?', '').split('&').map(param => param.split('='))
        this.#routeParams = activeLayout.pattern.exec(location.href).pathname.groups
        this.#hash = location.hash
        Store.set('layout', activeLayout.layout)
    }

    navigate(url, params, title) {
        history.pushState({}, title, BASE_URL + url)
        window.dispatchEvent(new PopStateEvent('popstate'))
    }
}

export const Router = new CRouter()
