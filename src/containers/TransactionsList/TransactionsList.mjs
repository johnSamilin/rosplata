//@ts-check

import { allowedUserStatuses } from "../../constants/userStatuses.mjs";
import { AuthManager } from "../../core/AuthManager.mjs";
import { ListComponent } from "../../core/ListComponent.mjs";
import { RequestManager } from "../../core/RequestManager.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";

importStyle('/src/containers/TransactionsList/TransactionsList.css')

const template = document.querySelector('template#transactions-list-template')
const Api = new RequestManager('transactions')

export class TransactionsList extends ListComponent {
    containerId = 'transactions-list'
    baseCssClass = 'transactions-list'
    #isInProgress = false
    #budgetId

    async importListItemComponent() {
        const { TransactionsListItem } = await import('../TransactionsListItem/TransactionsListItem.mjs')
        return TransactionsListItem
    }

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
        if (allowedUserStatuses.includes(budget?.currentUserStatus)) {
            Store.subscribe(`budgets.${id}.transactions`, this.#onTransactionsChanged)
            this.data = Store.get(`budgets.${id}.transactions`) ?? []
            const data = await Api.get('list', `transactions/${id}`)
            this.data = data ?? []
        }
    }

    #onTransactionsChanged = (transactions) => {
        this.data = transactions
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
            this.addItems(new Map([
                [id, transaction]
            ]))
            form.reset()
            await Api.post('create', 'transactions', { body: data })
            Store.push(`budgets.${this.#budgetId}.transactions`, transaction)
        } catch (er) {
            console.error('Can\'t create transaction', { er })
            this.children.get(id).syncronized = false
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
