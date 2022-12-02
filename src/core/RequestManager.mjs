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
            }
            this.#handles.set(reqId, new AbortController())
            try {
                const response = await fetch(`/api/${url}`, {
                    method,
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params?.body),
                    signal: this.#handles.get(reqId).signal,
                })
                return await response.json()
            } catch (er) {
                if (er.name !== 'AbortError') {
                    console.error('Request failed', er);
                }
            } finally {
                this.#handles.delete(reqId)
            }
        }
    }
}
