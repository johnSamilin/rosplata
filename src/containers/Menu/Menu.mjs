//@ts-check
import { Component } from '../../core/Component.mjs'
import { Router } from '../../core/Router.mjs'
import { BASE_URL } from '../../constants/routes.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/containers/Menu/Menu.css')

const menuTemplate = document.querySelector('template#menu-template')

export class Menu extends Component {
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
        const { Dialog } = await import('../Dialog/Dialog.mjs')
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