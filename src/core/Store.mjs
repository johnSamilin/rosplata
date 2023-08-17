//@ts-check

import { isEqual } from "../utils/utils.mjs"
import { FeatureDetector } from "./FeatureDetector.mjs"

const defaultState = {
    selectedBudgetId: -1,
    budgets: {},
    transactions: {},
    users: {},
    participants: {},
    layout: '',
    isMobile: FeatureDetector.isMobile,
}

const unpersistableStateItems = new Set(['selectedBudgetId', 'layout', 'isMobile'])

class CStore {
    #listeners = new Map()

    constructor() {
        this.data = JSON.parse(localStorage.getItem('data') ?? JSON.stringify(defaultState));
    }

    #persist() {
        const cleanData = {}
        for (const key in this.data) {
            if (!unpersistableStateItems.has(key)) {
                cleanData[key] = this.data[key]
            }
        }
        localStorage.setItem('data', JSON.stringify(cleanData))
    }

    data = defaultState

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
            this.#persist()
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
            this.#persist()
            this.#notify(fieldName, finalValue)
        }
    }
}


export const Store = new CStore()
