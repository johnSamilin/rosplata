//@ts-check

import { isEqual } from "../utils/utils.mjs"
import { FeatureDetector } from "./FeatureDetector.mjs"

class CStore {
    #listeners = new Map()

    // TODO: use proxy
    data = {
        selectedBudgetId: -1,
        budgets: {},
        layout: '',
        isMobile: FeatureDetector.isMobile,
    }

    subscribe(field, callback) {
        if (!this.#listeners.has(field)) {
            this.#listeners.set(field, new Set())
        }

        this.#listeners.get(field).add(callback)
    }

    unsubscribe(field, callback) {
        if (this.#listeners.has(field)) {
            this.#listeners.get(field).delete(callback)
        }
    }

    #notify(fieldName, newValue) {
        if (this.#listeners.has(fieldName)) {
            for (const cb of this.#listeners.get(fieldName)) {
                cb(newValue)
            }
        }
    }

    get(fieldName) {
        const accessors = `data.${fieldName}`.split('.')
        let value = this
        for (let index = 0; index < accessors.length; index++) {
            const acc = accessors[index];
            if (!Reflect.has(value, acc)) {
                return undefined
            }
            value = value[acc]

        }

        return value
    }

    has(fieldName) {
        let value = this
        const accessors = `data.${fieldName}`.split('.')
        for (let index = 0; index < accessors.length; index++) {
            const acc = accessors[index];
            if (!Reflect.has(value, acc)) {
                return false
            }
            value = value[acc]
        }

        return true
    }

    set(fieldName, value, bypassEqualityCheck = false) {
        const accessors = fieldName.split('.')
        const oldValue = this.get(fieldName)
        const isValueChanged = !isEqual(oldValue, value)
        if (isValueChanged || bypassEqualityCheck) {
            const last = accessors.pop()
            if (accessors.length > 0) {
                // @ts-ignore
                this.get(accessors.join('.'))[last] = value
            } else {
                // @ts-ignore
                this.data[last] = value
            }
            this.#notify(fieldName, value)
        }
    }

    push(fieldName, value) {
        const accessors = fieldName.split('.')
        if (this.has(fieldName)) {
            const last = accessors.pop()
            let finalValue = []
            if (accessors.length > 0) {
                const lastVal = this.get(accessors.join('.'))
                finalValue = lastVal[last].concat(value)
                lastVal[last] = finalValue
            } else {
                finalValue = this.data[last].concat(value)
                this.data[last] = finalValue
            }
            this.#notify(fieldName, finalValue)
        }
    }
}


export const Store = new CStore()
