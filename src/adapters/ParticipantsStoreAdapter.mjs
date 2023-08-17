import { RequestManager } from '../core/RequestManager.mjs'
import { Store } from '../core/Store.mjs'

const Api = new RequestManager('participants')

export class ParticipantsStoreAdapter {
    getList(budgetId) {
        return Store.get(`participants.${budgetId}`) ?? []
    }

    store(budgetId, participants) {
        Store.set(`participants.${budgetId}`, participants)
    }
    
    storeItem(budgetId, transaction) {
        const field = `participants.${budgetId}`
        if (!Store.has(field)) {
            Store.set('participants', {
                ...Store.get('participants'),
                [budgetId]: []
            })
        }
        Store.push(field, {
            ...transaction,
            isLocal: true,
        })
    }

    updateItem(budgetId, transactionId, patch) {
        const field = `participants.${budgetId}`
        const list = Store.get(field).map(transaction => {
            if (transaction.id === transactionId) {
                return {
                    ...transaction,
                    ...patch,
                    isLocal: true
                }
            }

            return transaction
        })
        Store.set(field, list)
    }
}
