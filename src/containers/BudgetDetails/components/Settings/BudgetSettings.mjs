// @ts-check
import { AuthManager } from '../../../../core/AuthManager.mjs'
import { Component } from '../../../../core/Component.mjs'
import { RequestManager } from '../../../../core/RequestManager.mjs'
import { Store } from '../../../../core/Store.mjs'
import { importStyle } from '../../../../utils/imports.js'

importStyle('/src/containers/BudgetDetails/components/Settings/BudgetSettings.css')

const template = document.querySelector('template#budget-settings-template')

const Api = new RequestManager('budget-settings')

export class BudgetSettings extends Component {
    containerId = 'budget-settings'
    id
    budgetId
    #isDirty = false
    #state = new Map([
        ['opened', false]
    ])

    set isDirty(val) {
        if (!val) {
            this.setAttr(this.getContainer(), `.${this.getCssClass('save-btn')}`, 'disabled', 'disabled')
        } else {
            this.getContainer()?.querySelector(`.${this.getCssClass('save-btn')}`)?.removeAttribute('disabled')
        }

        this.#isDirty = val
    }

    constructor() {
        super()
        if (!template) {
            throw new Error('#budget-settings-template must be present in the HTML!')
        }
        this.budgetId = Store.get('selectedBudgetId')
        Store.subscribe('selectedBudgetId', this.onSelectBudget)
    }

    renderTo(container) {
        //@ts-ignore
        const content = template.content.cloneNode(true)
        container.appendChild(content)
        Store.subscribe('selectedBudgetId', this.update)
        Store.subscribe('budgets', this.onSelectBudget)
    }

    async exterminate() {
        Store.unsubscribe('selectedBudgetId', this.update)
        Store.unsubscribe('budgets', this.onSelectBudget)
        await super.exterminate()
    }

    onSelectBudget = () => {
        const newId = Store.get('selectedBudgetId')
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
        this.stopListeners()
        if (budget.userId === AuthManager.data.id) {
            this.attachListeners()
        }
        this.getContainer()?.reset()
        this.#state = new Map([
            ['opened', budget.type === 'open'],
        ])
        if (this.#state.get('opened')) {
            this.setAttr(this.getContainer(), 'input[name="opened"]', 'checked', 'checked')
        } else {
            this.getContainer()?.querySelector('input[name="opened"]')?.removeAttribute('checked')
        }
        this.isDirty = false
    }

    #handleChange = (e) => {
        const fieldName = e.target.getAttribute('name')
        const value = e.target.checked
        this.isDirty = this.#state.get(fieldName) !== value
    }

    #handleSave = async (e) => {
        e.preventDefault()
        if (!this.#isDirty || this.isInProgress) {
            return
        }
        this.isInProgress = true
        const oldState = new Map([ ...this.#state.entries() ])
        try {
            const fd = new FormData(this.getContainer())
            this.#state.forEach((value, key) => {
                if (fd.has(key)) {
                    this.#state.set(key, fd.get(key))
                } else {
                    this.#state.set(key, false)
                }
            })
            this.isDirty = false
            await Api.post('save', `budgets/${this.budgetId}/settings`, { body: fd })
        } catch (er) {
            const { Alert } = await import('../../../Alert/Alert.mjs')
            new Alert('danger', er)
            this.#state = oldState
            this.isDirty = true
        } finally {
            this.isInProgress = false
            Store.set(`budgets.${this.budgetId}.type`, this.#state.get('opened') ? 'open' : 'private')
        }
    }

    listeners = new Set([
        {
            selector: '.budget-settings__save-btn',
            event: 'click',
            handler: this.#handleSave,
        },
        {
            selector: 'input',
            event: 'change',
            handler: this.#handleChange,
        }
    ])
}
