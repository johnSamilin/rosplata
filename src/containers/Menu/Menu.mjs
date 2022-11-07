//@ts-check
import { Component } from '../../core/Component.mjs'
import { Router } from '../../core/Router.mjs'
import { BASE_URL } from '../../constants/routes.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/containers/Menu/Menu.css')

const menuTemplate = document.querySelector('template#menu-template')
const itemTemplate = document.querySelector('template#menu-item-template')

export class Menu extends Component {
    containerId = 'menu'
    data = [
        {
            title: 'Budgets',
            link: '/',
        },
        {
            title: 'Settings',
            link: '/settings',
        },
        {
            title: 'Features support',
            link: '/settings/features',
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
            if (Router.currentRoute === BASE_URL + item.link) {
                itemContainer.classList.add('active')
            }
            content.appendChild(itemContainer)

        });
        parentContainer.appendChild(content)
        this.attachListeners()
    }

    update = (target) => {
        const container = target ?? this.getContainer()
        this.data.forEach(item => {
            const itemContainer = container.querySelector(`a[href="${item.link}"]`)
            if (Router.currentRoute === BASE_URL + item.link) {
                itemContainer.classList.add('active')
            } else {
                itemContainer.classList.remove('active')
            }
        })
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