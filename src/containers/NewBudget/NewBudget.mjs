//@ts-check

import { Component } from "../../core/Component.mjs"
import { Store } from "../../core/Store.mjs"
import { importStyle } from "../../utils/imports.js"
import { RequestManager } from "../../core/RequestManager.mjs"
import { Router } from "../../core/Router.mjs"
import DOMPurify from 'https://unpkg.com/dompurify@3.0.0/dist/purify.es.js'
import { AuthManager } from "../../core/AuthManager.mjs"
import { PARTICIPANT_STATUSES } from "../../constants/userStatuses.mjs"
import { BudgetForm } from "../../components/BudgetForm/BudgetForm.mjs"

importStyle('/src/containers/NewBudget/NewBudget.css')

const template = document.querySelector('template#new-budget-template')

const Api = new RequestManager('new-budget')

export class NewBudget extends Component {
    containerId = 'create-form'
    form

    constructor() {
        super()
        this.form = new BudgetForm(this.handleSubmit, this.handleReset)
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.firstElementChild.cloneNode(true)
        parent.appendChild(container)
        this.form.renderTo(container)
    }
    
    async show() {
        await super.show()
        this.form.show()
        this.attachListeners()
        Store.subscribe('budgets', this.updateParticipantsList)
        this.updateParticipantsList()
        this.getContainer()?.querySelector('input[name="name"]')?.focus()
    }

    async hide() {
        Store.subscribe('budgets', this.updateParticipantsList)
        this.form.hide()
        await super.hide()
        this.stopListeners()
    }

    updateParticipantsList = () => {
        this.suggestedParticipants = new Map(
            Object.values(Store.get('budgets'))
            .map(budget => budget.participants)
            .flat()
            .filter(({ userId }) => userId === AuthManager.data.id)
            .map(participant => [participant.userId, participant.user])
        )
        this.form.data.suggestedParticipants = this.suggestedParticipants
        this.form.update()
    }

    handleSubmit = async (event) => {
        debugger
        event.preventDefault()
        if (this.isInProgress) {
            return false
        }
        const data = this.form.getData()
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
            const { Alert } = await import('../Alert/Alert.mjs')
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
