//@ts-check

import { allowedUserStatuses } from "../../constants/userStatuses.mjs";
import { AuthManager } from "../../core/AuthManager.mjs";
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
    baseCssClass = 'transactions-list'
    #data = []
    #children = new Map()
    #isInProgress = false
    #budgetId

    constructor() {
        super()
        Store.subscribe('selectedBudgetId', this.sync)
    }

    sync = async (id) => {
        if (id === -1) {
            return
        }
        const budget = Store.get(`budgets.${id}`)
        this.addCssClassConditionally(
            !allowedUserStatuses.includes(budget?.currentUserStatus),
            'hidden',
            this.getContainer().querySelector(`.${this.getCssClass('new')}`)
        )
        Store.unsubscribe(`budgets.${this.#budgetId}.transactions`, this.#onTransactionsChanged)
        this.#budgetId = id
        this.#removeItems(this.#children)
        if (allowedUserStatuses.includes(budget?.currentUserStatus)) {
            Store.subscribe(`budgets.${id}.transactions`, this.#onTransactionsChanged)
            this.#data = Store.get(`budgets.${id}.transactions`) ?? []
            this.update()
            const data = await Api.get('list', `transactions/${id}`)
            this.#data = data
            this.update()
        }
    }

    #onTransactionsChanged = (transactions) => {
        this.#data = transactions
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
        Store.unsubscribe(`budgets.${this.#budgetId}.transactions`, this.#onTransactionsChanged)
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        parent.appendChild(container)
        this.attachListeners()
        this.update()
    }

    update = async () => {
        this.getContainer()?.classList.remove()
        const { enter, exit, update } = getListDataDiff(this.#children, this.#data)

        this.#removeItems(exit)
        this.#updateItems(update)
        await this.#addItems(enter)
        if (this.#children.size === 0) {
            this.addCssClass(this.getBemClass(null, 'empty'))
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

    #addTransaction = async (event) => {
        event.preventDefault()
        if (this.#isInProgress) {
            return false
        }
        const form = this.getContainer()?.querySelector('form.transactions-list__new')
        const data = new FormData(form)
        // @ts-ignore
        data.append('budgetId', Store.get('selectedBudgetId'))
        const id = Date.now()
        try {
            this.#isInProgress = true
            const transaction = {
                id,
                amount: data.get('amount'),
                user: AuthManager.data,
            }
            // @ts-ignore
            this.#addItems(new Map([
                [id, transaction]
            ]))
            form.reset()
            await Api.post('create', 'transactions', { body: data })
            Store.push(`budgets.${this.#budgetId}.transactions`, transaction)
        } catch (er) {
            console.error('Can\'t create transaction', { er })
            this.#children.get(id).syncronized = false
            const { Alert } = await import('../Alert/Alert.mjs')
            new Alert('warning', er)
        } finally {
            this.#isInProgress = false
        }
    }

    listeners = new Set([
        {
            selector: 'form.transactions-list__new',
            event: 'submit',
            handler: this.#addTransaction,
        }
    ])
}
