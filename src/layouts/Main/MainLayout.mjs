//@ts-check
// import MainLayoutStyles from './MainLayout.css' assert { type: 'css' } // static import will cause delay in execution
import { AnimatedComponent } from '../../core/Component.mjs'
import { BudgetList } from '../../containers/BudgetList/BudgetList.mjs'
import { BudgetDetails } from '../../containers/BudgetDetails/BudgetDetails.mjs'
import { Store } from '../../core/Store.mjs'
import { Router } from '../../core/Router.mjs'
import { importStyle } from '../../utils/imports.js'
import { FeatureDetector } from '../../core/FeatureDetector.mjs'
import { NewBudget } from '../../containers/NewBudget/NewBudget.mjs'

importStyle('/src/layouts/Main/MainLayout.css')

let budgetListController
let budgetDetailsController
let newBudgetController

const template = document.querySelector('template#layout-main-template')

export class MainLayout extends AnimatedComponent {
    containerId = 'layout-main'

    renderTo(parent) {
        budgetListController = new BudgetList()
        budgetDetailsController = new BudgetDetails()
        newBudgetController = new NewBudget()
        //@ts-ignore
        const content = template.content.cloneNode(true)
        parent?.appendChild(content)
        const contentContainer = parent?.querySelector(`#${this.containerId}`)
        budgetDetailsController.renderTo(contentContainer?.querySelector('#budget-details'))
        budgetListController.renderTo(contentContainer?.querySelector('#budgets-list'))
        newBudgetController.renderTo(contentContainer?.querySelector('#create-form'))
        this.attachListeners()
        this.update()
    }

    update() {
        const { id, create } = Router.routeParams
        const selectedBudgetId = id ? id : -1
        Store.set('selectedBudgetId', selectedBudgetId)
        if (FeatureDetector.isMobile && (
            selectedBudgetId !== -1
            || create
        )) {
            budgetListController.hide()
        } else {
            budgetListController.show()
        }
        selectedBudgetId !== -1 ? budgetDetailsController.show() : budgetDetailsController.hide()
        create ? newBudgetController.show() : newBudgetController.hide()
    }

    exterminate = async () => {
        await Promise.all([
            budgetDetailsController.exterminate(),
            budgetListController.exterminate(),
            newBudgetController.exterminate(),
        ])
        super.exterminate()
    }
}
