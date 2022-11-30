//@ts-check

import { FeatureDetector } from "../../core/FeatureDetector.mjs";
import { AnimatedComponent } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";

importStyle('/src/containers/BudgetDetails/BudgetDetails.css')

const template = document.querySelector('template#budget-details-template')

export class BudgetDetails extends AnimatedComponent {
    containerId = 'budget-details'
    data = {}
    abort = new AbortController()

    constructor(data) {
        super()
        this.data = data
        Store.subscribe('selectedBudgetId', this.sync)
    }

    sync = async (id) => {
        this.abort.abort()
        if (id === -1) {
            return
        }
        this.abort = new AbortController()
        const budget = Store.get('budgets')?.find(budget => budget.id === id)
        this.data = budget
        this.update()
        const data = await (await fetch(`https://dummyjson.com/products/${id}`, { signal: this.abort.signal })).json()
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
        this.setAttr(container, '#budget-details__title', 'textContent', this.data?.title)
        this.setAttr(container, '#budget-details__brand', 'textContent', this.data?.brand)
        this.setAttr(container, '#budget-details__category', 'textContent', this.data?.category ?? 'loading...')
        this.setAttr(container, '#budget-details__description', 'textContent', this.data?.description ?? 'loading...')
        this.setAttr(container, '#budget-details__discount', 'textContent', this.data?.discountPercentage ?? 'loading...')
        this.setAttr(container, '#budget-details__price', 'textContent', this.data?.price ?? 'loading...')
        this.setAttr(container, '#budget-details__rating', 'textContent', this.data?.rating ?? 'loading...')
        this.setAttr(container, '#budget-details__stock', 'textContent', this.data?.stock ?? 'loading...')
        const isBandwidthHigh = ['3g', '4g'].includes(FeatureDetector.connectionSpeed)
        this.setAttr(container, '#budget-details__thumbnail', 'src', isBandwidthHigh && this.data?.thumbnail, true)
    }

    listeners = new Set([
        {
            selector: 'button#budget-details__delete',
            event: 'click',
            handler: this.delete,
        },
    ])
}
