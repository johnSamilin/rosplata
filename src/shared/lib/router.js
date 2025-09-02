//@ts-check

import { BASE_URL, ROUTES } from "../config/routes"
import { AuthManager } from "./auth"
import { FeatureDetector } from "./feature-detector"
import { Store } from "./store"

if (!FeatureDetector.UrlPattern) {
    await import('../lib/polyfills/url-pattern')
}

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
        AuthManager.onLogin = this.#onRouteChange
        AuthManager.onLogout = () => Store.set('layout', 'login', true)
    }

    start() {
        if (AuthManager.isLoggedIn) {
            this.#onRouteChange()
        } else {
            Store.set('layout', 'login', true)
        }
    }

    #onRouteChange = (e) => {
        const activeLayout = this.#routeMatchers.find(({ pattern }) => pattern.test(location.href))
        if (!activeLayout) {
            console.error('Suitable layout not found');
            return false
        }
        const additionalParams = activeLayout.params ?? {}
        this.#currentRoute = location.pathname
        this.#queryParams = new Map(location.search.replace('?', '').split('&').map(param => param.split('=')))
        this.#routeParams = { ...activeLayout.pattern.exec(location.href).pathname.groups, ...additionalParams }
        this.#hash = location.hash
        Store.set('layout', activeLayout.layout, true)
    }

    navigate(url, force = false) {
        if (force) {
            history.replaceState({}, '', BASE_URL + url)
        } else {
            history.pushState({}, '', BASE_URL + url)
        }
        window.dispatchEvent(new PopStateEvent('popstate'))
    }

    back() {
        if (history.length > 1) {
            history.back()
            return true
        }
        return false
    }
}

export const Router = new CRouter()