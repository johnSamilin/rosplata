//@ts-check
// @ts-ignore
import MenuStyles from './Menu.css' assert { type: 'css' }
import { Component } from '../../core/Component.mjs'
import { BASE_URL } from '../../constants/routes.mjs'
import { Router } from '../../core/Router.mjs'

document.adoptedStyleSheets.push(MenuStyles)

const menuTemplate = document.querySelector('template#menu-template')
const itemTemplate = document.querySelector('template#menu-item-template')

export class Menu extends Component {
    containerId = 'menu'
    data = [
        {
            title: 'Budgets',
            link: BASE_URL + '/',
        },
        {
            title: 'Settings',
            link: BASE_URL + '/settings',
        },
    ]

    constructor() {
        super()
    }

    renderTo(parentContainer) {
        if (!menuTemplate) {
            throw new Error('Template for menu not found!')
        }
        // @ts-ignore
        const content = menuTemplate.content.cloneNode(true).firstElementChild
        this.data.forEach(item => {
            const itemContent = itemTemplate.content.cloneNode(true)
            const itemContainer = itemContent.querySelector('.menu-item')
            itemContainer.setAttribute('href', item.link)
            itemContainer.text = item.title
            if (Router.currentRoute === item.link) {
                itemContainer.classList.add('active')
            }
            content.appendChild(itemContainer)

        });
        parentContainer.appendChild(content)
        this.attachListeners()
    }

    update = (target) => {
        const container = target ?? this.getContainer()
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