//@ts-check

import { AnimatedComponent } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { TransactionsList } from "../TransactionsList/TransactionsList.mjs";
import { getBudgetBalanceFromTransactions } from "../../utils/utils.mjs";
import { allowedUserStatuses, PARTICIPANT_STATUSES } from "../../constants/userStatuses.mjs";
import { Alert } from "../Alert/Alert.mjs";

importStyle('/src/containers/BudgetDetails/BudgetDetails.css')

const template = document.querySelector('template#budget-details-template')
const Api = new RequestManager('budget')
let transactionsController

export class BudgetDetails extends AnimatedComponent {
    containerId = 'budget-details'
    baseCssClass = 'budget-details'
    data
    #isInProgress = false

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
        if (this.data) {
            Store.unsubscribe(`budgets.${this.data.id}.transactions`, this.#onTransactionsChanged)
        }
        Store.subscribe(`budgets.${id}.transactions`, this.#onTransactionsChanged)
        const budget = Store.get(`budgets.${id}`)
        this.data = budget
        this.update()
        const data = await Api.get('details', `budgets/${id}`)
        this.data = data
        this.update()
    }

    #onTransactionsChanged = (transactions) => {
        this.data.transactions = transactions
        this.update()
    }

    #onUserStatusChanged = (userStatus) => {
        this.data.currentUserStatus = userStatus
        if (allowedUserStatuses.includes(userStatus)) {
            this.sync(this.data.id)
            transactionsController.renderTo(this.getContainer()?.querySelector('.budget-details__transactions'))
        } else {
            this.update()
        }
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
        Store.unsubscribe(`budgets.${this.data.id}.transactions`, this.#onTransactionsChanged)
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
        const { myBalance, totalBalance } = getBudgetBalanceFromTransactions(this.data.transactions)
        this.setAttr(container, `.${this.getCssClass('counter', 'my')}`, 'textContent', Math.abs(myBalance).toString(10))
        const modifiers = []
        if (myBalance <= 0) {
            modifiers.push(myBalance < 0 ? 'negative' : 'zero')
        }
        this.addCssClass(this.getBemClass('counter', modifiers), container.querySelector(`.${this.getCssClass('counter', 'my')}`))
        this.setAttr(container, `.${this.getCssClass('counter', 'total')}`, 'textContent', Math.abs(totalBalance).toString(10))

        this.addCssClassConditionally(
            this.data?.currentUserStatus === PARTICIPANT_STATUSES.INVITED,
            this.getCssClass('actions', 'visible'),
            container.querySelector(`.${this.getCssClass('actions', 'invite')}`)
        )
        this.addCssClassConditionally(
            this.data?.currentUserStatus === PARTICIPANT_STATUSES.UNKNOWN,
            this.getCssClass('actions', 'visible'),
            container.querySelector(`.${this.getCssClass('actions', 'ask')}`)
        )
        this.addCssClassConditionally(
            this.data?.currentUserStatus === PARTICIPANT_STATUSES.WAIT_APPROVAL,
            this.getCssClass('actions', 'visible'),
            container.querySelector(`.${this.getCssClass('actions', 'wait')}`)
        )
    }

    onAcceptInvite = async () => {
        if (this.#isInProgress || this.data?.currentUserStatus !== PARTICIPANT_STATUSES.INVITED) {
            return false;
        }
        this.#isInProgress = true
        try {
            const { newStatus } = await Api.post('accept-invite', `budgets/${this.data.id}/participant/invite`)
            this.#onUserStatusChanged(newStatus)
        } catch (er) {
            new Alert('warning', er)
        } finally {
            this.#isInProgress = false
        }        
    }

    onDeclineInvite = async () => {
        if (this.#isInProgress || this.data?.currentUserStatus !== PARTICIPANT_STATUSES.INVITED) {
            return false;
        }
        try {
            const { newStatus } = await Api.delete('decline-invite', `budgets/${this.data.id}/participant/invite`)
            this.#onUserStatusChanged(newStatus)
        } catch (er) {
            new Alert('warning', er)
        } finally {
            this.#isInProgress = false
        }
    }

    onAskInvite = async () => {
        if (this.#isInProgress || this.data?.currentUserStatus !== PARTICIPANT_STATUSES.UNKNOWN) {
            return false;
        }
        try {
            const { newStatus } = await Api.put('ask-invite', `budgets/${this.data.id}/participant/invite`)
            this.#onUserStatusChanged(newStatus)
            this.update()
        } catch (er) {
            new Alert('warning', er)
        } finally {
            this.#isInProgress = false
        }
    }

    listeners = new Set([
        {
            selector: '#accept-invite',
            event: 'click',
            handler: this.onAcceptInvite,
        },
        {
            selector: '#decline-invite',
            event: 'click',
            handler: this.onDeclineInvite,
        },
        {
            selector: '#ask-invite',
            event: 'click',
            handler: this.onAskInvite,
        },
    ])
}
