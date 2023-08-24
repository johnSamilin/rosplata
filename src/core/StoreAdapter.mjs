import { RequestManager } from "./RequestManager.mjs"
import { SettingsManager } from "./SettingsManager.mjs"
import { Store } from "./Store.mjs"

export class StoreAdapter {
    tag
    api

    constructor(tag) {
        this.tag = tag
        this.api = new RequestManager(tag)
    }

    getList(parentEntityId) {
        return Store.get(`${this.tag}.${parentEntityId}`) ?? []
    }

    store(parentEntityId, entities) {
        Store.set(`${this.tag}.${parentEntityId}`, entities)
    }

    async storeItem(parentEntityId, entity, isLocalOnly = false) {
        const field = `${this.tag}.${parentEntityId}`
        if (!Store.has(field)) {
            Store.set(this.tag, {
                ...Store.get(this.tag),
                [parentEntityId]: []
            })
        }
        Store.push(field, {
            ...entity,
            isLocal: true,
        })

        if (!isLocalOnly) {
            return this.storeItemHook(entity)
        }
    }

    async storeItemHook(entity) {
        if (!SettingsManager.offlineMode) {
            return this.api.post('store', this.tag, { body: entity })
        }
    }

    async updateItem(parentEntityId, entityId, patch, isLocalOnly = false) {
        const field = `${this.tag}.${parentEntityId}`
        let entityToUpdate
        const list = Store.get(field).map(entity => {
            if (entity.id === entityId) {
                entityToUpdate = entity
                return {
                    ...entity,
                    ...patch,
                    isLocal: true
                }
            }

            return entity
        })
        Store.set(field, list)
        if (!isLocalOnly) {
            await this.storeItemHook(entityToUpdate)
        }
    }
}

export class MapStoreAdapter extends StoreAdapter {
    getList() {
        return Store.get(this.tag) ?? []
    }

    getItem(id) {
        const item = this.getList()[id]
        return item
    }

    async storeItem(entity, isLocalOnly = false) {
        Store.set(this.tag, {
            ...this.getList(),
            [entity.id]: {
                ...entity,
                isLocal: true,
            }
        })

        if (!isLocalOnly) {
            return this.storeItemHook(entity)
        }
    }

    async updateItem(entityId, patch, isLocalOnly = false) {
        const field = `${this.tag}.${entityId}`
        const entityToUpdate = {
            ...Store.get(field),
            ...patch,
            isLocal: true
        }
        Store.set(field, entityToUpdate)
        if (!isLocalOnly) {
            await this.storeItemHook(entityToUpdate)
        }
    }
}
