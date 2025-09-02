// @ts-check
import { BudgetFormFeature } from '../../../../features/budget-form'
import { AuthManager } from '../../../../shared/lib/auth'
import { Component } from '../../../../shared/ui/base'
import { RequestManager } from '../../../../shared/api/request-manager'
import { Store } from '../../../../shared/lib/store'
import { importStyle } from '../../../../shared/lib/imports'

importStyle('/src/widgets/budget-details/ui/components/budget-settings-widget.css')

const template = document.querySelector('template#budget-settings-template')

const Api = new RequestManager('budget-settings')

export class BudgetSettingsWidget extends Component {
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
        this.form = new BudgetFormFeature(this.#handleSubmit, this.#handleReset)
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
        const budget = Store.get(`budgets.${this.budgetId}`)
        try {
            const fd = this.form.getFormData()
            await Api.post('save', `budgets/${this.budgetId}/settings`, { body: fd })
            Store.set(`budgets.${this.budgetId}`, {
                ...budget,
                name: fd.get('name'),
                currency: fd.get('currency'),
                type: fd.get('isOpen') === 'on' ? 'open' : 'private',
                bannedUserTransactionsAction: fd.get('bannedUserTransactionsAction'),
            })
        } catch (er) {
            const { Alert } = await import('../../../../shared/ui/alert')
            new Alert('danger', er)
            console.error(er)
        } finally {
            this.isInProgress = false
        }
    }

    #handleReset = () => {}
}