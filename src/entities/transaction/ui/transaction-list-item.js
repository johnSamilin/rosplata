//@ts-check
import DOMPurify from 'https://unpkg.com/dompurify@3.0.0/dist/purify.es.js'
import { AuthManager } from "../../../shared/lib/auth";
import { Component } from "../../../shared/ui/base";
import { importStyle } from "../../../shared/lib/imports";
import { currencyFormatters } from "../../../shared/lib/utils";

importStyle('/src/entities/transaction/ui/transaction-list-item.css')

const template = document.querySelector('template#transactions-list-item-template')

export class TransactionListItem extends Component {
    baseCssClass = 'transactions-list-item'

    set syncronized(val) {
        this.addCssClassConditionally(!val, this.getCssClass('', 'local'))
    }

    constructor(data) {
        super()
        this.isReady = false
        this.data = data
        this.isReady = true
        this.containerId = data.id
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

    update = () => {
        const container = this.getContainer()
        this.setAttr(container, `.${this.getCssClass('image')}`, 'src', AuthManager.data.picture)
        this.setAttr(container, `.${this.getCssClass('name')}`, 'textContent', this.data.user.name)
        this.setAttr(container, `.${this.getCssClass('amount')}`, 'textContent', currencyFormatters.get(this.data.currency)?.format(this.data.amount))
        this.addCssClassConditionally(
            this.data.user.id === AuthManager.data.id && !this.data.deleted,
            this.getCssClass('delete', 'shown'),
            container?.querySelector(`.${this.getCssClass('delete')}`)
        )
        this.addCssClassConditionally(
            this.data.user.id === AuthManager.data.id && this.data.deleted,
            this.getCssClass('revert', 'shown'),
            container?.querySelector(`.${this.getCssClass('revert')}`)
        )
        this.addCssClassConditionally(
            this.data.deleted || this.data.banned,
            this.getCssClass(undefined, 'deleted'),
            container
        )
        if (this.data.comment) {
            this.setAttr(container, `.${this.getCssClass('comment')}`, 'textContent', DOMPurify.sanitize(this.data.comment))
        }
    }

    listeners = new Set([])
}