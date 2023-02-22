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

    async importListItemComponent() {
        const { TransactionsListItem } = await import('../TransactionsListItem/TransactionsListItem.mjs')
        return TransactionsListItem
    }

    #onTransactionsChanged = (transactions) => {
        this.data = transactions
    }

    async show() {
        const budgetId = Store.get('selectedBudgetId')
        this.attachListeners()
        Store.subscribe(`budgets.${budgetId}.transactions`, this.#onTransactionsChanged)
        super.show()
    }

    async hide() {
        const budgetId = Store.get('selectedBudgetId')
        this.stopListeners()
        Store.unsubscribe(`budgets.${budgetId}.transactions`, this.#onTransactionsChanged)
        super.hide()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        parent.appendChild(container)
        this.attachListeners()
    }

    #addTransaction = async (event) => {
        event.preventDefault()
        if (this.isInProgress || !this.isActive) {
            return false
        }
        const form = this.getContainer()?.querySelector('form.transactions-list__new')
        const data = new FormData(form)
        const budgetId = Store.get('selectedBudgetId')
        // @ts-ignore
        data.append('budgetId', budgetId)
        const id = Date.now()
        try {
            this.isInProgress = true
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
            Store.push(`budgets.${budgetId}.transactions`, transaction)
        } catch (er) {
            console.error('Can\'t create transaction', { er })
            this.children.get(id).syncronized = false
            const { Alert } = await import('../Alert/Alert.mjs')
            new Alert('warning', er)
        } finally {
            this.isInProgress = false
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
