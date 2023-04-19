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
        this.getContainer()?.querySelector('input[name="name"]')?.focus()
    }

    async hide() {
        await super.hide()
        this.stopListeners()
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
        try {
            this.isInProgress = true
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
