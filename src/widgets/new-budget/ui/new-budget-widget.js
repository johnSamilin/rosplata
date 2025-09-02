//@ts-check

import { Component } from "../../../shared/ui/base"
import { Store } from "../../../shared/lib/store"
import { importStyle } from "../../../shared/lib/imports"
import { RequestManager } from "../../../shared/api/request-manager"
import { Router } from "../../../shared/lib/router"
import DOMPurify from 'https://unpkg.com/dompurify@3.0.0/dist/purify.es.js'
import { AuthManager } from "../../../shared/lib/auth"
import { PARTICIPANT_STATUSES } from "../../../shared/config/user-statuses"
import { BudgetFormFeature } from "../../../features/budget-form"

importStyle('/src/widgets/new-budget/ui/new-budget-widget.css')

const template = document.querySelector('template#new-budget-template')

const Api = new RequestManager('new-budget')

export class NewBudgetWidget extends Component {
    containerId = 'create-form'
    form

    constructor() {
        super()
        this.form = new BudgetFormFeature(this.handleSubmit, this.handleReset)
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.firstElementChild.cloneNode(true)
        parent.appendChild(container)
        this.form.renderTo(container)
        this.form.editable = true
    }

    async show() {
        await super.show()
        this.form.show()
        Store.subscribe('budgets', this.updateParticipantsList)
        this.updateParticipantsList()
    }

    async hide() {
        Store.subscribe('budgets', this.updateParticipantsList)
        this.form.hide()
        await super.hide()
    }

    updateParticipantsList = () => {
        this.suggestedParticipants = new Map(
            Object.values(Store.get('budgets'))
                .map(budget => budget.participants)
                .flat()
                .filter(({ userId }) => userId !== AuthManager.data.id)
                .map(participant => [participant.userId, participant.user])
        )
        this.form.values = {
            ...this.form.values,
            suggestedParticipants: this.suggestedParticipants
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault()
        if (this.isInProgress) {
            return false
        }
        const data = this.form.getFormData()
        const id = crypto.randomUUID()
        const name = DOMPurify.sanitize(data.get('name'))
        const currency = data.get('currency')
        data.set('name', name)
        data.set('id', id)
        const budgets = Store.get('budgets') ?? {}
        budgets[id] = {
            id,
            name,
            userId: AuthManager.data.id,
            transactions: [],
            type: data.get('isOpen') ? 'open' : 'private',
            participants: [{
                id: AuthManager.data.id,
                status: PARTICIPANT_STATUSES.OWNER,
                user: {
                    id: AuthManager.data.id,
                    name: AuthManager.data.name,
                }
            }],
            currentUserStatus: PARTICIPANT_STATUSES.OWNER,
            currency,
        }
        for (const participant of this.suggestedParticipants ?? new Map()) {
            if (data.get(`participant-${participant[0]}`) === 'on') {
                data.append('suggestedParticipants[]', participant[0])
                budgets[id].participants.push({
                    id: participant[0],
                    status: PARTICIPANT_STATUSES.INVITED,
                    user: {
                        id: participant[0],
                        name: participant[1].name
                    }
                })
            }
            data.delete(`participant-${participant[0]}`)
        }
        try {
            this.isInProgress = true
            await Api.put('create', 'budgets', { body: data })
            Store.set('budgets', budgets)
            Router.navigate(`/budgets/${id}?fresh`)
        } catch (er) {
            const { Alert } = await import('../../../shared/ui/alert')
            new Alert('danger', er)
            console.error('Can\'t create budget', { er })
        } finally {
            this.isInProgress = false
        }
    }

    handleReset = () => {
        Router.navigate('/')
    }
}