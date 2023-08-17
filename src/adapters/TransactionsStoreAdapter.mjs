import { RequestManager } from '../core/RequestManager.mjs'
import { Store } from '../core/Store.mjs'

const Api = new RequestManager('transactions')

export class TransactionsStoreAdapter {
    getList(budgetId) {
        return Store.get(`transactions.${budgetId}`) ?? []
    }

    getItem(budgetId, transactionId) {
        return Store.get(`transactions.${budgetId}.${transactionId}`) ?? []
    }

    storeItem(budgetId, transaction) {
        const field = `transactions.${budgetId}`
        if (!Store.has(field)) {
            Store.set('transactions', {
                ...Store.get('transactions'),
                [budgetId]: []
            })
        }
        Store.push(field, {
            ...transaction,
            isLocal: true,
        })
    }

    updateItem(budgetId, transactionId, patch) {
        const field = `transactions.${budgetId}`
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
