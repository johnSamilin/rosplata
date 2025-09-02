import { Component } from '../../../shared/ui/base'
import { importStyle } from '../../../shared/lib/imports'

importStyle('/src/features/budget-form/ui/budget-form.css')
const template = document.querySelector('template#budget-form-template')

export class BudgetFormFeature extends Component {
    baseCssClass = 'budget-form'
    containerId = 'budget-form'
    #values = {
        name: '',
        suggestedParticipants: new Map(),
        currency: undefined,
        isOpen: false,
        bannedUserTransactionsAction: 'keep',
    }
    #editable = true
    fields = [
        {
            name: 'name',
            type: 'input',
        }, {
            name: 'currency',
            type: 'select',
        }, {
            name: 'isOpen',
            type: 'checkbox',
        }, {
            name: 'bannedUserTransactionsAction',
            type: 'select',
        },
    ]

    set values(val) {
        this.#values = val
        this.update()
    }

    get values() {
        return this.#values
    }

    set editable(val) {
        this.#editable = val
        this.update()
        if (this.#editable) {
            this.attachListeners()
        } else {
            this.stopListeners()
        }
    }

    constructor(onSubmit, onReset, initialData) {
        super()
        if (initialData) {
            this.#values = initialData
        }
        this.listeners.add({
            event: 'submit',
            handler: onSubmit,
        })
        this.listeners.add({
            event: 'reset',
            handler: onReset,
        })
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.firstElementChild.cloneNode(true)
        this.containerId = `${this.containerId}.${crypto.randomUUID()}`
        this.setAttr(container, undefined, 'id', this.containerId)
        this.update(container)
        parent.appendChild(container)
    }

    getFormData = () => {
        return new FormData(this.getContainer())
    }
    
    reset() {
        this.getContainer().reset()
    }

    setFieldValue = (container, value, type) => {
        if (!this.#editable) {
            this.setAttr(container, undefined, 'disabled', 'disabled')
        } else {
            container.removeAttribute('disabled')
        }

        switch (type) {
            case 'input':
                this.setAttr(container, undefined, 'value', value)
                break
            case 'select':
                this.setAttr(container, undefined, 'value', value)
                container.querySelectorAll('option').forEach(option => {
                    const currentValue = option.getAttribute('value')
                    if (value === currentValue) {
                        option.setAttribute('selected', true)
                    } else {
                        option.removeAttribute('selected')
                    }
                })
                break
            case 'checkbox':
                if (value) {
                    this.setAttr(container, undefined, 'checked', value)
                } else {
                    container.removeAttribute('checked')
                }
                break
        }
    }

    update = (target) => {
        const container = target ?? this.getContainer()
        if (!container) {
            return false
        }

        this.fields.forEach((field) => {
            const fContainer = container.querySelector(`[name=${field.name}]`)
            this.setFieldValue(fContainer, this.#values[field.name], field.type)
        })

        const tpl = template.content.querySelector('.budget-form__suggested-participants')
        const parentContainer = container?.querySelector('.budget-form__suggested-participants')
        parentContainer?.querySelectorAll('.budget-form__suggested-participants-item').forEach(node => node.remove())
        this.addCssClassConditionally(
            !this.#values.suggestedParticipants || this.#values.suggestedParticipants.size === 0,
            'hidden',
            container.querySelector('.budget-form__participants')
        )
        for (const participant of this.#values.suggestedParticipants ?? new Map()) {
            const container = tpl.cloneNode(true)
            this.setAttr(container, 'label', 'for', `participant-${participant[0]}`)
            this.setAttr(container, 'label', 'textContent', participant[1].name)
            this.setAttr(container, 'input', 'name', `participant-${participant[0]}`)
            this.setAttr(container, 'input', 'id', `participant-${participant[0]}`)
            this.setAttr(container, 'input', 'value', participant[1].id)
            parentContainer?.appendChild(container)
        }
        this.addCssClassConditionally(
            !this.#editable,
            'hidden',
            container.querySelector('.budget-form__buttons')
        )
    }
}