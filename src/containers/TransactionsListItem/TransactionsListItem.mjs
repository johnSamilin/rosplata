//@ts-check

import { Component } from "../../core/Component.mjs";
import { importStyle } from "../../utils/imports.js";

importStyle('/src/containers/TransactionsListItem/TransactionsListItem.css')

const template = document.querySelector('template#transactions-list-item-template')

export class TransactionsListItem extends Component {
    containerId = 'transaction'
    #data

    constructor(data) {
        super()
        this.#data = data
        this.containerId = `transaction-${data.id}`
    }

    renderTo(parent) {
        if (!template) {
            throw new Error('#transactions-list-item-template must be present in the HTML!')
        }

        //@ts-ignore
        const container = template.content.firstElementChild.cloneNode(true)
        container.setAttribute('id', this.containerId)
        parent.appendChild(container)
        this.update()
    }
    
    update() {
        const container = this.getContainer()
        this.setAttr(container, '.transactions-list-item__image', 'src', this.#data.user.picture)
        this.setAttr(container, '.transactions-list-item__image', 'alt', this.#data.user.name)
        this.setAttr(container, '.transactions-list-item__name', 'textContent', this.#data.user.name)
        this.setAttr(container, '.transactions-list-item__amount', 'textContent', this.#data.amount)
    }

    listeners = new Set([])
}
