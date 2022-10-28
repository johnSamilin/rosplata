import { Component } from '../../core/Component.mjs'
import { importStyle } from '../../utils/imports.js';

importStyle('/src/containers/Dialog/Dialog.css')

export class CDialog extends Component {
    containerId = 'modal-window'

    handleClick = (event) => {
        if (event.target === event.currentTarget) {
            // backdrop click
            this.hide()
        }
    }

    show() {
        this.getContainer().showModal()
        this.listeners = new Set(this.#defaultListeners)
        this.attachListeners()
    }

    hide = () => {
        const container = this.getContainer()
        container.close()
        this.stopListeners()
        this.listeners.clear()
        container.innerHTML = ''
        this.setAttr(container, undefined, 'class', ' ')
    }

    #defaultListeners = [
        {
            event: 'close',
            handler: this.hide,
        },
        {
            event: 'click',
            handler: this.handleClick,
        }
    ]
}

export const Dialog = new CDialog()
