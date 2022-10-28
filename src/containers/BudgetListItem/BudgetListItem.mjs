//@ts-check
import { Component } from '../../core/Component.mjs'
import { Store } from '../../core/Store.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/containers/BudgetListItem/BudgetListItem.css')

const template = document.querySelector('template#budgets-list-item-template')

export class BudgetListItem extends Component {
    data
    id

    constructor(data) {
        super()
        this.data = data
        this.containerId = `budget-${this.data.id}`
        this.id = data.id
        Store.subscribe('selectedBudgetId', this.updateSelectedState)
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
        container.querySelector('.budget-title').textContent = this.data.title
        container?.setAttribute('id', this.containerId)
        container?.setAttribute('data-id', this.id)
    }

    updateSelectedState = (selectedBudgetId) => {
        if (this.id === selectedBudgetId) {
            this.getContainer()?.classList.add('budgets-list-item--selected')
        } else {
            this.getContainer()?.classList.remove('budgets-list-item--selected')
        }
    }

    exterminate = async () =>  {
        Store.unsubscribe('selectedBudgetId', this.updateSelectedState)
        await super.exterminate()
    }

}
