//@ts-check
import { Component } from '../../../shared/ui/base'
import { Router } from '../../../shared/lib/router'
import { BASE_URL } from '../../../shared/config/routes'
import { importStyle } from '../../../shared/lib/imports'

importStyle('/src/widgets/menu/ui/menu-widget.css')

const menuTemplate = document.querySelector('template#menu-template')

export class MenuWidget extends Component {
    containerId = 'menu'

    renderTo(parentContainer) {
        if (!menuTemplate) {
            throw new Error('Template for menu not found!')
        }
        // @ts-ignore
        const content = menuTemplate.content.cloneNode(true).firstElementChild
        parentContainer.appendChild(content)
        this.attachListeners()
    }

    #onItemClick = async () => {
        const { Dialog } = await import('../../../shared/ui/dialog')
        Dialog.hide()
    }

    listeners = new Set([
        {
            selector: '.menu-item',
            event: 'click',
            handler: this.#onItemClick,
        }
    ])
}