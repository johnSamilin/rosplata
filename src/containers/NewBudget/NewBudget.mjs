//@ts-check

import { Component } from "../../core/Component.mjs"
import { Store } from "../../core/Store.mjs"
import { importStyle } from "../../utils/imports.js"
import { RequestManager } from "../../core/RequestManager.mjs"
import { Router } from "../../core/Router.mjs"
import DOMPurify from 'https://unpkg.com/dompurify@3.0.0/dist/purify.es.js'
import { AuthManager } from "../../core/AuthManager.mjs"
import { PARTICIPANT_STATUSES } from "../../constants/userStatuses.mjs"

importStyle('/src/containers/NewBudget/NewBudget.css')

const template = document.querySelector('template#new-budget-template')

const Api = new RequestManager('new-budget')

export class NewBudget extends Component {
    containerId = 'create-form'

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        parent.appendChild(container)
    }
    
    async show() {
        await super.show()
        this.attachListeners()
        Store.subscribe('budgets', this.updateParticipantsList)
        this.updateParticipantsList()
        this.getContainer()?.querySelector('input[name="name"]')?.focus()
    }

    async hide() {
        Store.subscribe('budgets', this.updateParticipantsList)
        await super.hide()
        this.stopListeners()
    }

    updateParticipantsList = () => {
        const tpl = template.content.querySelector('.new-budget__suggested-participants')
        this.suggestedParticipants = new Map(
            Object.values(Store.get('budgets'))
                .map(budget => budget.participants)
                .flat()
                .map(participant => [participant.userId, participant.user])
            )
        const parentContainer = this.getContainer()?.querySelector('.new-budget__suggested-participants')
        parentContainer?.querySelector('.new-budget__suggested-participants-item')?.remove()
        for (const participant of this.suggestedParticipants) {
            if (participant[0] === AuthManager.data.id || !participant[0]) {
                continue
            }
            const container = tpl.cloneNode(true)
            this.setAttr(container, 'label', 'for', `participant-${participant[0]}`)
            this.setAttr(container, 'label', 'textContent', participant[1].name)
            this.setAttr(container, 'input', 'name', `participant-${participant[0]}`)
            this.setAttr(container, 'input', 'id', `participant-${participant[0]}`)
            this.setAttr(container, 'input', 'value', participant[1].id)
            parentContainer?.appendChild(container)
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault()
        if (this.isInProgress) {
            return false
        }
        const form = this.getContainer()?.querySelector('form#new-budget__form')
        const data = new FormData(form)
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
        for (const participant of this.suggestedParticipants) {
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
            this.stopListeners()
            form.reset()
            this.resetParticipants()
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

    resetParticipants() {
        const parentContainer = this.getContainer()?.querySelector('.new-budget__suggested-participants')
        parentContainer.innerHTML = ''
    }

    listeners = new Set([
        {
            selector: 'form#new-budget__form',
            event: 'submit',
            handler: this.handleSubmit,
        },
        {
            selector: 'form#new-budget__form',
            event: 'reset',
            handler: this.handleReset,
        },
    ])
}
