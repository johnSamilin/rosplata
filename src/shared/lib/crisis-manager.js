class CCrisisManager {
    #clientId

    constructor() {
        this.#clientId = crypto.randomUUID()
    }

    logError(error) {
        fetch('/api/stats/error', {
            headers: { 'Content-Type': 'application/json' },
            method: 'post',
            body: JSON.stringify({
                error: error.message ?? error,
                clientId: this.#clientId
            })
        })
    }
}

export const CrisisManager = new CCrisisManager()