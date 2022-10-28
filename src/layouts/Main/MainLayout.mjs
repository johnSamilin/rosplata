//@ts-check
// import MainLayoutStyles from './MainLayout.css' assert { type: 'css' } // static import will cause delay in execution
import { Component } from '../../core/Component.mjs'
import { BudgetList } from '../../containers/BudgetList/BudgetList.mjs'
import { BudgetDetails } from '../../containers/BudgetDetails/BudgetDetails.mjs'
import { Store } from '../../core/Store.mjs'
import { Router } from '../../core/Router.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/layouts/Main/MainLayout.css')

let budgetListController
let budgetDetailsController

const template = document.querySelector('template#layout-main-template')

export class MainLayout extends Component {
    containerId = 'layout-main'

    renderTo(parent) {
        budgetListController = new BudgetList()
        budgetDetailsController = new BudgetDetails()
        //@ts-ignore
        const content = template.content.cloneNode(true)
        parent?.appendChild(content)
        const contentContainer = parent?.querySelector(`#${this.containerId}`)
        budgetDetailsController.renderTo(contentContainer?.querySelector('#budget-details'))
        budgetListController.renderTo(contentContainer?.querySelector('#budgets-list'))
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
