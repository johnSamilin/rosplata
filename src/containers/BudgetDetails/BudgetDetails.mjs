//@ts-check

import { AnimatedComponent } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { TransactionsList } from "../TransactionsList/TransactionsList.mjs";
import { currencyFormatters, getBudgetBalanceFromTransactions, mapArrayToObjectId } from "../../utils/utils.mjs";
import { allowedUserStatuses, PARTICIPANT_STATUSES } from "../../constants/userStatuses.mjs";
import { Alert } from "../Alert/Alert.mjs";
import { ParticipantsList } from "../ParticipantsList/ParticipantsList.mjs";
import { FeatureDetector } from "../../core/FeatureDetector.mjs";
import { Router } from '../../core/Router.mjs'
import { BudgetSettings } from "./components/Settings/BudgetSettings.mjs";
import { filterBannedUserTransactions } from "../../utils/transactionsUtils.mjs";

importStyle('/src/containers/BudgetDetails/BudgetDetails.css')

const template = document.querySelector('template#budget-details-template')
const Api = new RequestManager('budget')
const transactionsController = new TransactionsList()
const participantsController = new ParticipantsList()
const settingsController = new BudgetSettings()

const isMobile = FeatureDetector.isMobile

export class BudgetDetails extends AnimatedComponent {
    containerId = 'budget-details'
    baseCssClass = 'budget-details'

    constructor(data) {
        super()
        this.data = data
        Store.subscribe('selectedBudgetId', this.sync)
    }

    sync = async (id) => {
        if (id === -1) {
            return
        }
        if (this.data) {
            Store.unsubscribe(`budgets.${this.data.id}.transactions`, this.#onTransactionsChanged)
            Store.unsubscribe(`budgets.${this.data.id}.participants`, this.#onParticipantsChanged)
            Store.unsubscribe(`budgets.${this.data.id}`, this.onBudgetUpdated)
        }
        Store.subscribe(`budgets.${id}.transactions`, this.#onTransactionsChanged)
        Store.subscribe(`budgets.${id}.participants`, this.#onParticipantsChanged)
        Store.subscribe(`budgets.${id}`, this.onBudgetUpdated)
        const budget = Store.get(`budgets.${id}`)
        this.data = budget
        transactionsController.data = mapArrayToObjectId(
            filterBannedUserTransactions(
                this.data?.transactions,
                this.data?.participants,
                this.data.bannedUserTransactionsAction === 'ignore'
            ) ?? []
        )
        participantsController.data = mapArrayToObjectId(this.data?.participants ?? [], ({ userId }) => userId)
        const data = await Api.get('details', `budgets/${id}`)
        Store.set(`budgets.${id}`, data)

        if (this.data?.participants?.length === 1 && Router.queryParams.has('fresh')) { // only the owner
            this.showInviteDialog()
        }
    }

    #onTransactionsChanged = (transactions) => {
        this.data.transactions = transactions
        this.update()
    }

    #onParticipantsChanged = (participants) => {
        const transactions = filterBannedUserTransactions(
            this.data?.transactions,
            participants,
            this.data.bannedUserTransactionsAction === 'ignore'
        ) ?? []
        transactionsController.data = mapArrayToObjectId(transactions)
        participantsController.data = mapArrayToObjectId(participants, ({ userId }) => userId)
        this.data.participants = participants
        this.data.transactions = transactions
        this.update()
    }

    #onUserStatusChanged = (userStatus) => {
        this.data.currentUserStatus = userStatus
        if (allowedUserStatuses.includes(userStatus)) {
            this.sync(this.data.id)
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
        Store.unsubscribe('selectedBudgetId', this.sync)
        Store.unsubscribe(`budgets.${this.data?.id}.transactions`, this.#onTransactionsChanged)
        Store.unsubscribe(`budgets.${this.data?.id}.participants`, this.#onParticipantsChanged)
        Store.unsubscribe(`budgets.${this.data.id}`, this.onBudgetUpdated)
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        this.update(container)
        parent.appendChild(container)
        transactionsController.renderTo(this.getContainer()?.querySelector(`.${this.getCssClass('transactions')}`))
        participantsController.renderTo(this.getContainer()?.querySelector(`.${this.getCssClass('participants')}`))
        settingsController.renderTo(this.getContainer()?.querySelector(`.${this.getCssClass('settings')}`))
    }

    onBudgetUpdated = (data) => {
        const transactions = filterBannedUserTransactions(
            data.transactions,
            data.participants,
            data.bannedUserTransactionsAction === 'ignore'
        ) ?? []
        transactionsController.data = mapArrayToObjectId(transactions)
        this.data = {
            ...data,
            transactions,
        }
    }

    update = (target) => {
        const container = target ?? this.getContainer()
        if (!this.data) {
            return
        }

        if (allowedUserStatuses.includes(this.data?.currentUserStatus)) {
            transactionsController.show()
            participantsController.show()
        } else {
            transactionsController.hide()
            participantsController.hide()
        }
        if (isMobile) {
            this.addCssClassConditionally(
                !allowedUserStatuses.includes(this.data?.currentUserStatus),
                'hidden',
                container.querySelector('#settings-btn')
            )
        }

        const { myBalance, totalBalance } = getBudgetBalanceFromTransactions(this.data.transactions, this.data.participants)
        this.setAttr(container, `.${this.getCssClass('counter', 'my')}`, 'textContent', currencyFormatters.get(this.data.currency)?.format(Math.abs(myBalance)))
        this.addCssClassConditionally(
            !allowedUserStatuses.includes(this.data?.currentUserStatus) && this.data?.type === 'open',
            'hidden',
            container.querySelector(`.${this.getCssClass('counter', 'my')}`).parentElement
        )
        this.addCssClassConditionally(
            myBalance > 0,
            this.getCssClass('counter', 'positive'),
            container.querySelector(`.${this.getCssClass('counter', 'my')}`)
        )
        this.addCssClassConditionally(
            myBalance < 0,
            this.getCssClass('counter', 'negative'),
            container.querySelector(`.${this.getCssClass('counter', 'my')}`)
        )
        this.setAttr(container, `.${this.getCssClass('counter', 'total')}`, 'textContent', currencyFormatters.get(this.data.currency)?.format(totalBalance))
        this.setAttr(container, `.${this.getCssClass('title')}`, 'textContent', this.data.name)

        this.addCssClassConditionally(
            !allowedUserStatuses.includes(this.data?.currentUserStatus) && this.data?.type === 'open',
            this.getCssClass('actions', 'visible'),
            container.querySelector(`.${this.getCssClass('actions', 'isopen')}`)
        )
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
        this.addCssClassConditionally(
            this.data?.currentUserStatus === PARTICIPANT_STATUSES.OWNER,
            this.getCssClass('actions', 'visible'),
            container.querySelector(`.${this.getCssClass('actions', 'send-invite')}`)
        )
    }

    onAcceptInvite = async () => {
        if (this.isInProgress || this.data?.currentUserStatus !== PARTICIPANT_STATUSES.INVITED) {
            return false;
        }
        this.isInProgress = true
        try {
            const { newStatus } = await Api.post('accept-invite', `budgets/${this.data.id}/participant/invite`)
            this.#onUserStatusChanged(newStatus)
        } catch (er) {
            new Alert('warning', er)
        } finally {
            this.isInProgress = false
        }
    }

    onDeclineInvite = async () => {
        if (this.isInProgress || this.data?.currentUserStatus !== PARTICIPANT_STATUSES.INVITED) {
            return false;
        }
        try {
            const { newStatus } = await Api.delete('decline-invite', `budgets/${this.data.id}/participant/invite`)
            this.#onUserStatusChanged(newStatus)
        } catch (er) {
            new Alert('warning', er)
        } finally {
            this.isInProgress = false
        }
    }

    onAskInvite = async () => {
        if (this.isInProgress || this.data?.currentUserStatus !== PARTICIPANT_STATUSES.UNKNOWN) {
            return false;
        }
        try {
            const { newStatus } = await Api.put('ask-invite', `budgets/${this.data.id}/participant/invite`)
            this.#onUserStatusChanged(newStatus)
            this.update()
        } catch (er) {
            new Alert('warning', er)
        } finally {
            this.isInProgress = false
        }
    }

    showInviteDialog = async () => {
        if (this.isInProgress) {
            return false
        }
        this.isInProgress = true
        try {
            if (this.data?.currentUserStatus !== PARTICIPANT_STATUSES.OWNER) {
                return false
            }
            const { InviteDialog } = await import('../../components/InviteDialog/InviteDialog.mjs')
            InviteDialog.data = {
                url: `${location.origin}${location.pathname}`,
                title: 'Share a budget',
                text: 'Hey, share a budget with me!',
            }
            InviteDialog.show()
        } finally {
            this.isInProgress = false
        }
    }

    onShowSettings = (e) => {
        e.stopPropagation()
        this.addCssClassConditionally(
            isMobile,
            this.getCssClass('aside', 'visible'),
            this.getContainer()?.querySelector(`.${this.getCssClass('aside')}`)
        )
    }

    onHideSettings = (e) => {
        e.stopPropagation()
        this.getContainer()?.querySelector(`.${this.getCssClass('aside')}`)?.classList.remove(
            this.getCssClass('aside', 'visible')
        )
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
        {
            selector: '#send-invite',
            event: 'click',
            handler: this.showInviteDialog,
        },
        {
            selector: '#settings-btn',
            event: 'click',
            handler: this.onShowSettings,
        },
        {
            selector: '#settings-close-btn',
            event: 'click',
            handler: this.onHideSettings,
        },
    ])
}
