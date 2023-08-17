import { RequestManager } from '../core/RequestManager.mjs'
import { Store } from '../core/Store.mjs'

const Api = new RequestManager('users')

export class UsersStoreAdapter {
    getList() {
        return Store.get(`users`) ?? []
    }

    store(users) {
        Store.set(`users`, users)
    }
}
