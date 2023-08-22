// @ts-check
import { BudgetForm } from '../../../../components/BudgetForm/BudgetForm.mjs'
import { AuthManager } from '../../../../core/AuthManager.mjs'
import { Component } from '../../../../core/Component.mjs'
import { Store } from '../../../../core/Store.mjs'
import { MapStoreAdapter } from '../../../../core/StoreAdapter.mjs'
import { importStyle } from '../../../../utils/imports.js'

importStyle('/src/containers/BudgetDetails/components/Settings/BudgetSettings.css')

const template = document.querySelector('template#budget-settings-template')

const budgetsAdapter = new MapStoreAdapter('budgets')

export class BudgetSettings extends Component {
    containerId = 'budget-settings'
    id
    budgetId
    form

    constructor() {
        super()
        if (!template) {
            throw new Error('#budget-settings-template must be present in the HTML!')
        }
        this.budgetId = Store.get('selectedBudgetId')
        this.form = new BudgetForm(this.#handleSubmit, this.#handleReset)
        Store.subscribe('selectedBudgetId', this.onSelectBudget)
    }

    renderTo(container) {
        //@ts-ignore
        const content = template.content.cloneNode(true)
        container.appendChild(content)
        Store.subscribe('selectedBudgetId', this.update)
        Store.subscribe('budgets', this.onSelectBudget)
        this.form.renderTo(this.getContainer())
    }

    async exterminate() {
        Store.unsubscribe('selectedBudgetId', this.update)
        Store.unsubscribe('budgets', this.onSelectBudget)
        await super.exterminate()
    }

    onSelectBudget = () => {
        const newId = Store.get('selectedBudgetId')
        this.form.reset()
        Store.unsubscribe('selectedBudgetId', this.update)
        Store.subscribe(`budgets.${newId}`, this.update)
        this.budgetId = newId
        this.update()
    }

    update = () => {
        const budget = Store.get(`budgets.${this.budgetId}`)
        if (!budget) {
            return
        }
        this.form.values = {
            name: budget.name,
            currency: budget.currency,
            isOpen: budget.type === 'open',
            suggestedParticipants: new Map(),
            bannedUserTransactionsAction: budget.bannedUserTransactionsAction,
        }
        this.form.editable = budget.userId === AuthManager.data.id
    }

    #handleSubmit = async (e) => {
        e.preventDefault()
        if (this.isInProgress) {
            return
        }
        this.isInProgress = true
        const budget = budgetsAdapter.getItem(this.budgetId)
        try {
            const fd = this.form.getFormData()
            await budgetsAdapter.updateItem(this.budgetId, {
                ...budget,
                name: fd.get('name'),
                currency: fd.get('currency'),
                type: fd.get('isOpen') === 'on' ? 'open' : 'private',
                bannedUserTransactionsAction: fd.get('bannedUserTransactionsAction'),
            })
        } catch (er) {
            const { Alert } = await import('../../../../components/Alert/Alert.mjs')
            new Alert('danger', er)
            console.error(er)
        } finally {
            this.isInProgress = false
        }
    }

    #handleReset = () => {}
}
