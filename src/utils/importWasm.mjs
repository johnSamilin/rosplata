import './wasm_exec.js'

export function importWasm(path) {
    const go = new Go()
    return new Promise((resolve, reject) => {
        WebAssembly.instantiateStreaming(fetch(path), go.importObject)
            .then(result => {
                go.run(result.instance)
                resolve(result.instance)
            })
            .catch(error => {
                reject(error)
            })
    })
}
