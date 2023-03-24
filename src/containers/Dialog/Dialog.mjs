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
        this.attachListeners()
        window.history.pushState({ dialogOpened: true }, null, location.href)
        window.addEventListener('popstate', this.#onPopstate)
    }

    hide = (removeHistoryState = true) => {
        const container = this.getContainer()
        container.close()
        this.stopListeners()
        container.innerHTML = ''
        this.setAttr(container, undefined, 'class', 'border-1')
        if (removeHistoryState) {
            window.history.back()
        }
    }

    #onPopstate = (e) => {
        this.hide(false)
        window.removeEventListener('popstate', this.#onPopstate)
    }

    listeners = new Set([
        {
            event: 'close',
            handler: this.hide,
        },
        {
            event: 'click',
            handler: this.handleClick,
        }
    ])
}

export const Dialog = new CDialog()
