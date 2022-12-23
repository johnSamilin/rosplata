//@ts-check

import { Component } from "../../core/Component.mjs";
import { RequestManager } from "../../core/RequestManager.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { getListDataDiff } from "../../utils/utils.mjs";

importStyle('/src/containers/TransactionsList/TransactionsList.css')

const template = document.querySelector('template#transactions-list-template')
const Api = new RequestManager('transactions')

export class TransactionsList extends Component {
    containerId = 'transactions-list'
    #data = []
    #children = new Map()

    constructor() {
        super()
        Store.subscribe('selectedBudgetId', this.sync)
    }

    sync = async (id) => {
        if (id === -1) {
            return
        }
        this.#removeItems(this.#children)
        this.#data = Store.get(`budgets.${id}.transactions`) ?? []
        this.update()
        const data = await Api.get('list', `transactions/${id}`)
        this.#data = data
        this.update()
    }

    async show() {
        this.attachListeners()
        super.show()
    }

    async hide() {
        this.stopListeners()
        super.hide()
    }

    exterminate() {
        Store.unsubscribe('selectedBudgetId')
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        parent.appendChild(container)
        this.update()
    }

    update = async () => {
        this.getContainer()?.classList.remove('transactions-list--empty')
        const { enter, exit, update } = getListDataDiff(this.#children, this.#data)

        this.#removeItems(exit)
        this.#updateItems(update)
        await this.#addItems(enter)
        if (this.#children.size === 0) {
            this.getContainer()?.classList.add('transactions-list--empty')
        }
    }

    async #addItems(items) {
        const container = this.getContainer()?.querySelector('.transactions-list__items')
        const { TransactionsListItem } = await import('../TransactionsListItem/TransactionsListItem.mjs')
        for (const [id, item] of items) {
            const newItem = new TransactionsListItem(item)
            this.#children.set(id, newItem)
            newItem.renderTo(container)
        }
    }

    #updateItems(items) {
        for (const [id, child] of items) {
            this.#children.get(id).data = child
            this.#children.get(id).update()
        }
    }

    #removeItems(items) {
        for (const [id, child] of items) {
            child.exterminate()
            this.#children.delete(id)
        }
    }

    listeners = new Set([])
}
