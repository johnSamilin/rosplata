
class CRequestManager {
    #handles = new Map()

    async make(id, method, url, params) {
        if (this.#handles.has(id)) {
            this.#handles.get(id).abort()
        }
        this.#handles.set(id, new AbortController())
        try {
            const response = await fetch(`/api/${url}`, {
                method,
                body: params?.body,
                credentials: 'same-origin'
            })
            return await response.json()
        } catch (er) {
            console.error('Request failed', er);
        } finally {
            this.#handles.delete(id)
        }

    }
}

export const RequestManager = new CRequestManager()
