//@ts-check

import { TransactionsStoreAdapter } from "../../Adapters/TransactionsStoreAdapter.mjs";
import { AuthManager } from "../../core/AuthManager.mjs";
import { ListComponent } from "../../core/ListComponent.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { mapArrayToObjectId } from "../../utils/utils.mjs";

importStyle('/src/containers/TransactionsList/TransactionsList.css')

const template = document.querySelector('template#transactions-list-template')
const transactionsAdapter = new TransactionsStoreAdapter()

export class TransactionsList extends ListComponent {
    containerId = 'transactions-list'
    baseCssClass = 'transactions-list'

    async importListItemComponent() {
        const { TransactionsListItem } = await import('../TransactionsListItem/TransactionsListItem.mjs')
        return TransactionsListItem
    }

    #onTransactionsChanged = (transactions) => {
        this.data = mapArrayToObjectId(transactions)
    }

    async show() {
        const budgetId = Store.get('selectedBudgetId')
        this.attachListeners()
        Store.subscribe(`transactions.${budgetId}`, this.#onTransactionsChanged)
        super.show()
    }

    async hide() {
        const budgetId = Store.get('selectedBudgetId')
        this.stopListeners()
        Store.unsubscribe(`transactions.${budgetId}`, this.#onTransactionsChanged)
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
        const { currency } = Store.get(`budgets.${budgetId}`)
        // @ts-ignore
        const id = crypto.randomUUID()
        try {
            this.isInProgress = true
            const transaction = {
                id,
                amount: data.get('amount'),
                user: AuthManager.data,
                currency,
                comment: data.get('comment'),
                deleted: false,
            }
            // @ts-ignore
            this.addItems(new Map([
                [id, transaction]
            ]))
            form.reset()
            transactionsAdapter.storeItem(budgetId, transaction)
        } catch (er) {
            console.error('Can\'t create transaction', { er })
            const { Alert } = await import('../../components/Alert/Alert.mjs')
            new Alert('warning', er)
        } finally {
            this.isInProgress = false
        }
    }

    #handleClick = async (evt) => {
        const deleteBtnClicked = evt.target.classList.contains('transactions-list-item__delete')
        const revertBtnClicked = evt.target.classList.contains('transactions-list-item__revert')
        if (deleteBtnClicked || revertBtnClicked) {
            const container = evt.target.parentNode
            const transactionId = container.getAttribute('id')
            const isDeleted = deleteBtnClicked
            if (this.data[transactionId] && this.data[transactionId].user.id === AuthManager.data.id) {
                const budgetId = Store.get('selectedBudgetId')
                try {
                    transactionsAdapter.updateItem(
                        budgetId,
                        transactionId,
                        {
                            deleted: isDeleted,
                        })
                } catch (er) {
                    const { Alert } = await import('../../components/Alert/Alert.mjs')
                    new Alert('danger', er)
                }
            }
        }
    }

    listeners = new Set([
        {
            selector: 'form.transactions-list__new',
            event: 'submit',
            handler: this.#addTransaction,
        },
        {
            selector: '.transactions-list__items',
            event: 'click',
            handler: this.#handleClick,
        },
    ])
}
