//@ts-check

import { Component } from "../../core/Component.mjs";
import { Store } from "../../core/Store.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { Router } from "../../core/Router.mjs";

importStyle('/src/containers/NewBudget/NewBudget.css')

const template = document.querySelector('template#new-budget-template')

const Api = new RequestManager('new-budget')

export class NewBudget extends Component {
    containerId = 'create-form'
    isInProgress = false

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
        try {
            this.isInProgress = true
            await Api.put('create', 'budgets', { body: data })
            const budgets = await Api.get('list', 'budgets')
            Store.set('budgets', budgets)
            form.reset()
        } catch(er) {
            console.error('Can\'t create budget', { er })
        } finally {
            this.isInProgress = false
        }
    }

    handleReset = () => {
        if (!Router.back()) {
            Router.navigate('/')
        }
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
