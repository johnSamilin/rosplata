import { Component } from '../../core/Component.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/components/BudgetForm/BudgetForm.css')
const template = document.querySelector('template#budget-form-template')

export class BudgetForm extends Component {
    baseCssClass = 'budget-form'
    containerId = 'budget-form'
    data = {
        name: '',
        suggestedParticipants: new Map(),
        currency: undefined,
        isOpen: false,
    }

    constructor(onSubmit, onReset, initialData) {
        super()
        if (initialData) {
            this.data = initialData
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
        this.update(container)
        parent.appendChild(container)
    }

    show() {
        super.show()
        this.attachListeners()
    }

    hide() {
        this.stopListeners()
    }

    getData = () => {
        return new FormData(this.getContainer())
    }

    update = (target) => {
        const container = target ?? this.getContainer()

        const tpl = template.content.querySelector('.budget-form__suggested-participants')
        const parentContainer = container?.querySelector('.budget-form__suggested-participants')
        parentContainer?.querySelectorAll('.budget-form__suggested-participants-item').forEach(node => node.remove())
        this.addCssClassConditionally(
            !this.data.suggestedParticipants || this.data.suggestedParticipants.size === 0,
            'hidden',
            container.querySelector('.budget-form__participants')
        )
        for (const participant of this.data.suggestedParticipants ?? new Map()) {
            const container = tpl.cloneNode(true)
            this.setAttr(container, 'label', 'for', `participant-${participant[0]}`)
            this.setAttr(container, 'label', 'textContent', participant[1].name)
            this.setAttr(container, 'input', 'name', `participant-${participant[0]}`)
            this.setAttr(container, 'input', 'id', `participant-${participant[0]}`)
            this.setAttr(container, 'input', 'value', participant[1].id)
            parentContainer?.appendChild(container)
        }
        
    }
}
