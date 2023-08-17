import { RequestManager } from '../core/RequestManager.mjs'
import { Store } from '../core/Store.mjs'
import { mapArrayToObjectId } from '../utils/utils.mjs'

const Api = new RequestManager('budgets')

export class BudgetsStoreAdapter {
    getList() {
        return Store.get('budgets') ?? {}
    }

    getItem(id) {
        const item = this.getList()[id]
        return item
    }

    async request() {
        const data = await Api.get('list', 'budgets')
        if (data !== undefined) {
            Store.set('budgets', mapArrayToObjectId(data))
        }
    }

    store(budget) {
        Store.set('budgets', {
            ...this.getList(),
            [budget.id]: {
                ...budget,
                isLocal: true,
            }
        })
    }
    
    updateItem(budgetId, patch) {
        const field = `budgets.${budgetId}`
        Store.set(field, {
            ...Store.get(field),
            ...patch,
            isLocal: true
        })
    }
}
