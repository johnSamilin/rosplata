//@ts-check
// import MainLayoutStyles from './MainLayout.css' assert { type: 'css' } // static import will cause delay in execution
import { Component } from '../../utils/Component.mjs'
import { BudgetList } from '../../containers/BudgetList/BudgetList.mjs'
import { BudgetDetails } from '../../containers/BudgetDetails/BudgetDetails.mjs'

//@ts-ignore
import('./MainLayout.css', { assert: { type: 'css' } }).then(MainLayoutStyles => {
    document.adoptedStyleSheets.push(MainLayoutStyles.default)
})

const budgetListController = new BudgetList()
const budgetDetailsController = new BudgetDetails()

const template = document.querySelector('template#layout-main-template')

export class MainLayout extends Component {
    containerId = 'layout'

    async render() {
        //@ts-ignore
        const content = template.content.cloneNode(true)
        const container = this.getContainer()
        container?.appendChild(content)
        container?.querySelector('#budget-details')?.appendChild(budgetDetailsController.render())
        container?.querySelector('#budget-list')?.appendChild(await budgetListController.render())
        this.attachListeners()
    }

    exterminate = async () => {
        await Promise.all([
            budgetDetailsController.exterminate(),
            budgetListController.exterminate(),
        ])
        super.exterminate()
    }

    listeners = new Set([
        {
            selector: 'button#budget-list__menu-button',
            event: 'click',
            handler: this.exterminate,
        }
    ])
}
