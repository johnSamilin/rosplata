import { AuthManager } from "../lib/auth"

export class RequestManager {
    // deduping
    #handles = new Map()
    #tag

    constructor(tag) {
        if (!tag) {
            throw new Error('Tag must be specified')
        }
        this.#tag = tag
    }

    get = this.#make('GET')
    post = this.#make('POST')
    put = this.#make('PUT')
    delete = this.#make('DELETE')

    #make(method) {
        return async (id, url, params) => {
            const reqId = `${this.#tag}.${id}`
            if (this.#handles.has(reqId)) {
                this.#handles.get(reqId).abort()
                this.#handles.delete(reqId)
            }
            this.#handles.set(reqId, new AbortController())
            try {
                const authHeaders = {
                    'Authorization': `Bearer ${AuthManager.data.token}`,
                }
                const headers = params?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }
                const body = params?.body instanceof FormData ? params?.body : JSON.stringify(params?.body)
                if (this.#handles.get(reqId).signal.aborted) {
                    throw new AbortError()
                }
                const response = await fetch(`/api/${url}`, {
                    method,
                    headers: {
                        ...headers,
                        ...authHeaders,
                    },
                    body,
                    signal: this.#handles.get(reqId).signal,
                })
                if (response.status === 401) {
                    AuthManager.isLoggedIn = false
                }
                if (response.status >= 300) {
                    if (response.status === 404) {
                        throw new Error('Can\'t find that request...')
                    }
                    throw new Error((await response.json()).error)
                } else {
                    return await response.json()
                }
            } catch (er) {
                if (er.name !== 'AbortError') {
                    import('../lib/crisis-manager').then(({ CrisisManager }) => {
                        CrisisManager.logError(er)
                    })
                    throw er.message;
                }
            }
        }
    }
}