//@ts-check
// @ts-ignore
import BudgetListItemStyles from './BudgetListItem.css' assert { type: 'css' }
import { Component } from '../../utils/Component.mjs'

document.adoptedStyleSheets.push(BudgetListItemStyles)

const template = document.querySelector('template#budget-list-item-template')

export class BudgetListItem extends Component {
    data
    id

    constructor(data) {
        super()
        this.data = data
        this.containerId = `budget-${this.data.id}`
        this.id = data.id
    }

    render() {
        this.stopListeners()
        if (!template) {
            throw new Error('Template for budget-list-item not found!')
        }
        // @ts-ignore
        const content = template.content.cloneNode(true)
        this.update(content)
        return content
    }
    
    update(target) {        
        const container = target ?? this.getContainer()
        container.querySelector('.budget-title').textContent = this.data.title
        container.querySelector('.budget-list-item')?.setAttribute('id', this.containerId)        
    }

}
