//@ts-check

import { AnimatedComponent } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { TransactionsList } from "../TransactionsList/TransactionsList.mjs";
import { getBudgetBalanceFromTransactions, mapArrayToObjectId } from "../../utils/utils.mjs";
import { allowedUserStatuses, PARTICIPANT_STATUSES } from "../../constants/userStatuses.mjs";
import { Alert } from "../Alert/Alert.mjs";
import { ParticipantsList } from "../ParticipantsList/ParticipantsList.mjs";

importStyle('/src/containers/BudgetDetails/BudgetDetails.css')

const template = document.querySelector('template#budget-details-template')
const Api = new RequestManager('budget')
const transactionsController = new TransactionsList()
const participantsController = new ParticipantsList()

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
        }
        Store.subscribe(`budgets.${id}.transactions`, this.#onTransactionsChanged)
        Store.subscribe(`budgets.${id}.participants`, this.#onParticipantsChanged)
        const budget = Store.get(`budgets.${id}`)
        this.data = budget
        transactionsController.budgetId = this.data?.id
        participantsController.budgetId = this.data?.id
        transactionsController.data = mapArrayToObjectId(this.data?.transactions ?? [])
        participantsController.data = mapArrayToObjectId(this.data?.participants ?? [], ({ userId }) => userId)
        const data = await Api.get('details', `budgets/${id}`)
        this.data = data
        transactionsController.data = mapArrayToObjectId(data?.transactions ?? [])
        participantsController.data = mapArrayToObjectId(data?.participants ?? [], ({ userId }) => userId)
    }

    #onTransactionsChanged = (transactions) => {
        this.data.transactions = transactions
        this.update()
    }

    #onParticipantsChanged = (participants) => {
        this.data.participants = participants
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
        Store.unsubscribe(`budgets.${this.data.id}.transactions`, this.#onTransactionsChanged)
        Store.subscribe(`budgets.${this.data.id}.participants`, this.#onParticipantsChanged)
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        this.update(container)
        parent.appendChild(container)
        transactionsController.renderTo(this.getContainer()?.querySelector('.budget-details__transactions'))
        participantsController.renderTo(this.getContainer()?.querySelector('.budget-details__participants'))
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

    onSendInvite = async () => {
        if (this.isInProgress) {
            return false
        }
        this.isInProgress = true
        try {
            const { AuthManager } = await import('../../core/AuthManager.mjs')
            if (this.data.userId !== AuthManager.data.id) {
                return false
            }
            const { FeatureDetector } = await import('../../core/FeatureDetector.mjs')
            if (FeatureDetector.isMobile) {
                const { importWasm: loadWasm } = await import('../../utils/importWasm.mjs')
                await loadWasm('/src/utils/go-qr-code-generator.wasm')
                const { Dialog } = await import('../Dialog/Dialog.mjs')
                // TODO: use separate view
                const img = document.createElement('img')
                img.style.width = '300px'
                img.style.height = '300px'
                img.style.display = 'block'
                Dialog.getContainer()?.appendChild(img)
                img.setAttribute('src', `data:image/png;base64,${window.generateQrCode('test')}`)
                Dialog.show()
            } else {
                const dataToShare = {
                    url: 'test',
                    text: 'Share a budget with me!',
                    title: this.data.title
                }
                if (navigator.canShare(dataToShare)) {
                    await navigator.share(dataToShare)
                } else {
                    const { Alert } = await import('../Alert/Alert.mjs')
                    new Alert('danger', 'Hmm, seems like you cannot share')
                }
            }
        } catch (er) {
            const { Alert } = await import('../Alert/Alert.mjs')
            new Alert('danger', `Hmm, seems like you cannot share ${er}`)
        } finally {
            this.isInProgress = false
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
        {
            selector: '#send-invite',
            event: 'click',
            handler: this.onSendInvite,
        },
    ])
}
