//@ts-check

import { allowedUserStatuses } from "../../../shared/config/user-statuses";
import { AuthManager } from "../../../shared/lib/auth";
import { ListComponent } from "../../../shared/ui/list-component";
import { RequestManager } from "../../../shared/api/request-manager";
import { Store } from "../../../shared/lib/store";
import { importStyle } from "../../../shared/lib/imports";
import { mapArrayToObjectId } from "../../../shared/lib/utils";

importStyle('/src/widgets/transactions-list/ui/transactions-list-widget.css')

const template = document.querySelector('template#transactions-list-template')
const Api = new RequestManager('transactions')

export class TransactionsListWidget extends ListComponent {
    containerId = 'transactions-list'
    baseCssClass = 'transactions-list'

    async importListItemComponent() {
        const { TransactionListItem } = await import('../../../entities/transaction/ui/transaction-list-item')
        return TransactionListItem
    }

    #onTransactionsChanged = (transactions) => {
        this.data = mapArrayToObjectId(transactions)
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
        const { currency } = Store.get(`budgets.${budgetId}`)
        // @ts-ignore
        const id = crypto.randomUUID()
        data.append('budgetId', budgetId)
        data.append('id', id)
        data.append('currency', currency)
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
            await Api.post('create', 'transactions', { body: data })
            Store.push(`budgets.${budgetId}.transactions`, transaction)
        } catch (er) {
            console.error('Can\'t create transaction', { er })
            this.children.get(id).syncronized = false
            const { Alert } = await import('../../../shared/ui/alert')
            new Alert('warning', er)
        } finally {
            this.isInProgress = false
        }
    }

    #handleClick = async (evt) => {
        const deleteBtnClicked = evt.target.closest('.transactions-list-item__delete')
        const revertBtnClicked = evt.target.closest('.transactions-list-item__revert')
        if (deleteBtnClicked || revertBtnClicked) {
            const container =  deleteBtnClicked ? deleteBtnClicked.parentNode : revertBtnClicked.parentNode
            const transactionId = container.getAttribute('id')
            const isDeleted = deleteBtnClicked ? true : false
            if (this.data[transactionId] && this.data[transactionId].user.id === AuthManager.data.id) {
                const budgetId = Store.get('selectedBudgetId')
                const transactions = Store.get(`budgets.${budgetId}.transactions`)
                try {
                    Store.set(`budgets.${budgetId}.transactions`, transactions.map(t => {
                        if (t.id === transactionId) {
                            return {
                                ...t,
                                deleted: isDeleted
                            }
                        }

                        return t
                    }))
                    if (deleteBtnClicked) {
                        await Api.delete(`delete-${transactionId}`, `transactions/${transactionId}`)
                    } else {
                        await Api.post(`delete-${transactionId}`, `transactions/${transactionId}/restore`)
                    }
                } catch (er) {
                    Store.set(`budgets[${budgetId}].transactions`, transactions.map(t => {
                        if (t.id === transactionId) {
                            t.deleted = !isDeleted
                        }

                        return t
                    }))
                    const { Alert } = await import('../../../shared/ui/alert')
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