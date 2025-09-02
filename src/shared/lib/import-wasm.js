import './wasm-exec.js'

let wasmInitiated = false

export function importWasm(path) {
    if (wasmInitiated) {
        return Promise.resolve()
    }
    const go = new Go()
    return new Promise((resolve, reject) => {
        WebAssembly.instantiateStreaming(fetch(path), go.importObject)
            .then(result => {
                wasmInitiated = true
                go.run(result.instance)
                resolve(result.instance)
            })
            .catch(error => {
                reject(error)
            })
    })
}