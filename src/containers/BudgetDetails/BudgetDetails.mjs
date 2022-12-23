//@ts-check

import { AnimatedComponent } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { TransactionsList } from "../TransactionsList/TransactionsList.mjs";

importStyle('/src/containers/BudgetDetails/BudgetDetails.css')

const template = document.querySelector('template#budget-details-template')
const Api = new RequestManager('budget')
let transactionsController

export class BudgetDetails extends AnimatedComponent {
    containerId = 'budget-details'
    data

    constructor(data) {
        super()
        this.data = data
        Store.subscribe('selectedBudgetId', this.sync)
        transactionsController = new TransactionsList()
    }

    sync = async (id) => {
        if (id === -1) {
            return
        }
        const budget = Store.get(`budgets.${id}`)
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
    
    exterminate() {
        Store.unsubscribe('selectedBudgetId')
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        this.update(container)
        parent.appendChild(container)
        transactionsController.renderTo(this.getContainer()?.querySelector('.budget-details__transactions'))
    }

    update = (target) => {
        const container = target ?? this.getContainer()
        if (!this.data) {
            return
        }
        const myBalance = 0
        const totalBalance = this.data.transactions?.reduce((acc, t) => acc + parseFloat(t.amount), 0) ?? 0
        this.setAttr(container, '.budget-details__counter--my', 'textContent', Math.abs(myBalance).toString(10))
        container.querySelector('.budget-details__counter--my')?.classList.add(`budget-details__counter${myBalance < 0 ? '--negative' : (myBalance === 0 && '--zero')}`)
        this.setAttr(container, '.budget-details__counter--total', 'textContent', Math.abs(totalBalance).toString(10))
    }

    listeners = new Set([])
}
