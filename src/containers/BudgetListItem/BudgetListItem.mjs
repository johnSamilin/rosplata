//@ts-check
import { AnimatedComponent } from '../../core/Component.mjs'
import { Store } from '../../core/Store.mjs'
import { importStyle } from '../../utils/imports.js'
import { getBudgetBalanceFromTransactions } from '../../utils/utils.mjs'

importStyle('/src/containers/BudgetListItem/BudgetListItem.css')

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
        const { myBalance, totalBalance } = getBudgetBalanceFromTransactions(this.data.transactions)
        const balanceContainer = container.querySelector(`.${this.getCssClass('my-balance')}`)
        this.setAttr(balanceContainer, null, 'textContent', myBalance)
        this.addCssClassConditionally(myBalance < 0, this.getBemClass('counter', 'negative'), balanceContainer)
        this.addCssClassConditionally(myBalance > 0, this.getBemClass('counter', 'positive'), balanceContainer)
        container?.setAttribute('data-id', this.id)
        this.setAttr(container, null, 'data-status', this.data.currentUserStatus.toString())
        container.style.order = this.data.currentUserStatus
    }

    #onTransactionsChanged = (transactions) => {
        this.data = {
            ...this.data,
            transactions,
        }
    }

    updateSelectedState = (selectedBudgetId) => {
        this.addCssClassConditionally(this.id === selectedBudgetId, this.getCssClass(null, 'selected'))
    }

    exterminate = async () =>  {
        Store.unsubscribe('selectedBudgetId', this.updateSelectedState)        
        Store.unsubscribe(`budgets.${this.id}.transactions`, this.#onTransactionsChanged)
        await super.exterminate()
    }

}
