import { Component } from './base'
import { importStyle } from '../lib/imports';

importStyle('/src/shared/ui/dialog.css')

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
    }

    hide = () => {
        const container = this.getContainer()
        container.close()
        this.stopListeners()
        container.innerHTML = ''
        this.setAttr(container, undefined, 'class', 'border-1')
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