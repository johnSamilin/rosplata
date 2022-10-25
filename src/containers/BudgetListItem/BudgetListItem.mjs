//@ts-check
// @ts-ignore
import BudgetListItemStyles from './BudgetListItem.css' assert { type: 'css' }
import { Component } from '../../utils/Component.mjs'
import { Store } from '../../utils/Store.mjs'
import { importTemplate } from '../../utils/importAsset.mjs'

document.adoptedStyleSheets.push(BudgetListItemStyles)

await importTemplate('/src/containers/BudgetListItem/BudgetListItem.html')

const template = document.querySelector('template#budget-list-item-template')

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

    render() {
        this.stopListeners()
        if (!template) {
            throw new Error('Template for budget-list-item not found!')
        }
        // @ts-ignore
        const content = template.content.cloneNode(true)
        this.update(content.querySelector('.budget-list-item'))
        return content
    }
    
    update = (target) => {
        const container = target ?? this.getContainer()
        container.querySelector('.budget-title').textContent = this.data.title
        container?.setAttribute('id', this.containerId)
        container?.setAttribute('data-id', this.id)
    }

    updateSelectedState = (selectedBudgetId) => {
        if (this.id === selectedBudgetId) {
            this.getContainer()?.classList.add('budget-list-item--selected')
        } else {
            this.getContainer()?.classList.remove('budget-list-item--selected')
        }
    }

    exterminate = async () =>  {
        Store.unsubscribe('selectedBudgetId', this.updateSelectedState)
        await super.exterminate()
    }

}
