//@ts-check
import { AnimatedComponent } from '../../../shared/ui/base'
import { BudgetListWidget } from '../../../widgets/budget-list'
import { BudgetDetailsWidget } from '../../../widgets/budget-details'
import { Store } from '../../../shared/lib/store'
import { Router } from '../../../shared/lib/router'
import { importStyle } from '../../../shared/lib/imports'
import { FeatureDetector } from '../../../shared/lib/feature-detector'
import { NewBudgetWidget } from '../../../widgets/new-budget'
import { AuthManager } from '../../../shared/lib/auth'

importStyle('/src/pages/main/ui/main-page.css')

let budgetListController
let budgetDetailsController
let newBudgetController

const template = document.querySelector('template#layout-main-template')

export class MainPage extends AnimatedComponent {
    containerId = 'layout-main'

    constructor() {
        const params = Router.routeParams
        if (params[0] === 'demo') {
            AuthManager.requestDemoAccess()
        }
        super()
    }

    renderTo(parent) {
        budgetListController = new BudgetListWidget()
        budgetDetailsController = new BudgetDetailsWidget()
        newBudgetController = new NewBudgetWidget()
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