//@ts-check
// import MainLayoutStyles from './MainLayout.css' assert { type: 'css' } // static import will cause delay in execution
import { Component } from '../../utils/Component.mjs'
import { BudgetList } from '../../containers/BudgetList/BudgetList.mjs'
import { BudgetDetails } from '../../containers/BudgetDetails/BudgetDetails.mjs'
import { Store } from '../../utils/Store.mjs'
import { Router } from '../../utils/Router.mjs'
import { importStyle } from '../../utils/importAsset.mjs'

importStyle('/src/layouts/Main/MainLayout.css')

let budgetListController
let budgetDetailsController

const template = document.querySelector('template#layout-main-template')

export class MainLayout extends Component {
    containerId = 'layout-main'

    async render() {
        budgetListController = new BudgetList()
        budgetDetailsController = new BudgetDetails()
        //@ts-ignore
        const content = template.content.cloneNode(true)
        const layoutContainer = document.querySelector('#layout')
        layoutContainer?.appendChild(content)
        const contentContainer = layoutContainer?.querySelector(`#${this.containerId}`)
        contentContainer?.querySelector('#budget-details')?.appendChild(budgetDetailsController.render())
        contentContainer?.querySelector('#budget-list')?.appendChild(await budgetListController.render())
        this.attachListeners()
        this.update()
    }

    update() {
        const { id } = Router.routeParams
        Store.set('selectedBudgetId', id ? parseInt(id, 10) : -1)
    }

    exterminate = async () => {
        await Promise.all([
            budgetDetailsController.exterminate(),
            budgetListController.exterminate(),
        ])
        super.exterminate()
    }
}
