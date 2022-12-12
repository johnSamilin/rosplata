//@ts-check

import { FeatureDetector } from "../../core/FeatureDetector.mjs";
import { AnimatedComponent } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";

importStyle('/src/containers/BudgetDetails/BudgetDetails.css')

const template = document.querySelector('template#budget-details-template')

const Api = new RequestManager('budget')

export class BudgetDetails extends AnimatedComponent {
    containerId = 'budget-details'
    data = {}

    constructor(data) {
        super()
        this.data = data
        Store.subscribe('selectedBudgetId', this.sync)
    }

    sync = async (id) => {
        if (id === -1) {
            return
        }
        const budget = Store.get('budgets')?.find(budget => budget.id === id)
        this.data = budget
        this.update()
        const data = await Api.get('details', `budgets/${id}`)
        this.data = data
        this.update()
    }

    async show() {
        this.attachListeners()
        super.show()
    }

    async hide() {
        this.stopListeners()
        super.hide()
    }

    delete = () => {
        Store.set('selectedBudgetId', -1)
        const budgets = Store.get('budgets')
        Store.set('budgets', budgets?.filter(budget => budget.id !== this.data.id))
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        this.update(container)
        parent.appendChild(container)
    }

    update(target) {
        const container = target ?? this.getContainer()
        this.setAttr(container, '#budget-details__title', 'textContent', this.data?.name)
    }

    listeners = new Set([
        {
            selector: 'button#budget-details__delete',
            event: 'click',
            handler: this.delete,
        },
    ])
}
