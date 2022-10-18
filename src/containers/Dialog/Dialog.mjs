import { Component } from '../../utils/Component.mjs'

export class CDialog extends Component {
    containerId = 'modal-window'

    handleClick = (event) => {
        console.log(event.target, event.currentTarget);
        if (event.target === event.currentTarget) {
            // backdrop click
            this.hide()
        }
    }

    render(content) {
        this.getContainer().append(content)
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
