//@ts-check
import { AnimatedComponent } from '../../../shared/ui/base'
import { Store } from '../../../shared/lib/store'
import { importStyle } from '../../../shared/lib/imports'
import { currencyFormatters, getBudgetBalanceFromTransactions, getShortListOfParticipants } from '../../../shared/lib/utils'

importStyle('/src/entities/budget/ui/budget-list-item.css')

const template = document.querySelector('template#budgets-list-item-template')

export class BudgetListItem extends AnimatedComponent {
    baseCssClass = 'budgets-list-item'
    id

    constructor(data) {
        super()
        this.isReady = false
        this.data = data
        this.isReady = true
        this.containerId = `budget-${this.data.id}`
        this.id = data.id
        Store.subscribe('selectedBudgetId', this.updateSelectedState)
        Store.subscribe(`budgets.${data.id}.transactions`, this.#onTransactionsChanged)
        Store.subscribe(`budgets.${data.id}.participants`, this.#onParticipantsChanged)
    }

    renderTo(parent) {
        if (!template) {
            throw new Error('Template for budgets-list-item not found!')
        }
        // @ts-ignore
        const content = template.content.cloneNode(true)
        this.update(content.querySelector('.budgets-list-item'))
        parent.appendChild(content)
    }
    
    update = (target) => {
        const container = target ?? this.getContainer()
        container.querySelector(`.${this.getCssClass('title')}`).textContent = this.data.name
        container?.setAttribute('id', this.containerId)
        const { myBalance } = getBudgetBalanceFromTransactions(this.data.transactions, this.data.participants)
        const balanceContainer = container.querySelector(`.${this.getCssClass('my-balance')}`)
        if (myBalance !== 0) {
            this.setAttr(balanceContainer, null, 'textContent', currencyFormatters.get(this.data.currency)?.format(Math.abs(myBalance)))
            this.addCssClassConditionally(myBalance < 0, this.getCssClass('counter', 'negative'), balanceContainer)
            this.addCssClassConditionally(myBalance > 0, this.getCssClass('counter', 'positive'), balanceContainer)
        } else {
            balanceContainer.classList.remove(this.getCssClass('counter', 'negative'))
            balanceContainer.classList.remove(this.getCssClass('counter', 'positive'))
            this.setAttr(balanceContainer, null, 'textContent', ' ')
        }
        container?.setAttribute('data-id', this.id)
        this.setAttr(container, null, 'data-status', this.data.currentUserStatus.toString())
        container.style.order = this.data.currentUserStatus
        this.setAttr(container, `.${this.getCssClass('participants')}`, 'textContent', getShortListOfParticipants(this.data.participants))
    }

    #onTransactionsChanged = (transactions) => {
        this.data = {
            ...this.data,
            transactions,
        }
    }
    
    #onParticipantsChanged = (participants) => {
        this.data = {
            ...this.data,
            participants,
        }
    }

    updateSelectedState = (selectedBudgetId) => {
        this.addCssClassConditionally(this.id === selectedBudgetId, this.getCssClass(null, 'selected'))
    }

    exterminate = async () => {
        Store.unsubscribe('selectedBudgetId', this.updateSelectedState)
        Store.unsubscribe(`budgets.${this.id}.transactions`, this.#onTransactionsChanged)
        Store.unsubscribe(`budgets.${this.id}.participants`, this.#onParticipantsChanged)
        await super.exterminate()
    }

}