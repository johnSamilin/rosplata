// @ts-check
import { AnimatedComponent } from '../../core/Component.mjs'
import { getListDataDiff } from '../../utils/utils.mjs'
import { Store } from '../../core/Store.mjs'
import { importStyle } from '../../utils/imports.js'
import { RequestManager } from '../../core/RequestManager.mjs'

importStyle('/src/containers/BudgetList/BudgetList.css')

const template = document.querySelector('template#budgets-list-template')

export class BudgetList extends AnimatedComponent {
    #children = new Map()
    containerId = 'budgets-list'

    constructor() {
        super()
        Store.subscribe('budgets', this.update)
    }

    #handleItemClick = async (event) => {
        const clickedItemId = parseInt(event.target.closest('.budgets-list-item')?.dataset.id, 10)
        const clickedItem = this.#children.get(clickedItemId)
        if (!clickedItem) {
            return
        }
        const { Router } = await import('../../core/Router.mjs')
        Router.navigate(`/budgets/${clickedItem.id}`)
    }

    #handleItemRightClick = (event) => {
        event.preventDefault()
        const clickedItemId = event.target.closest('.budgets-list-item')?.id
        const clickedItem = this.#children.get(clickedItemId)
        clickedItem?.exterminate()
        this.#children.delete(clickedItemId)
    }

    #handleMenuBtnClick = async (event) => {
        event.preventDefault()
        event.target.classList.add('loading-rotate')
        const [{ Dialog }, { Menu }] = await Promise.all([
            import('../Dialog/Dialog.mjs'),
            import('../Menu/Menu.mjs'),
        ])
        const menuController = new Menu()
        menuController.renderTo(Dialog.getContainer())
        Dialog.show()
        Dialog.getContainer()?.classList.add('menu')
        event.target.classList.remove('loading-rotate')
    }

    async renderTo(parent) {
        if (!template) {
            throw new Error('#budgets-list must be present in the HTML!')
        }

        //@ts-ignore
        const container = template.content.cloneNode(true)

        this.getContainer()?.classList.add('loading')
        parent.appendChild(container)
        this.attachListeners()
        await this.#addItems(new Map(Store.get('budgets')?.map(budget => [budget.id, budget])))

        try {
            const data = await RequestManager.make('budgets-list', 'GET', 'budgets')
            Store.set('budgets', data)
        } catch (er) {
            console.error(er)
        } finally {
            this.getContainer()?.classList.remove('loading')
        }
    }

    update = async (newData) => {
        this.getContainer()?.classList.remove('budgets-list--empty')
        const { enter, exit, update } = getListDataDiff(this.#children, newData)

        this.#removeItems(exit)
        this.#updateItems(update)
        await this.#addItems(enter)
        if (this.#children.size === 0) {
            this.getContainer()?.classList.add('budgets-list--empty')
        }
    }

    async #addItems(items) {
        const container = this.getContainer()?.querySelector('#budgets-list__items')
        const { BudgetListItem } = await import('../BudgetListItem/BudgetListItem.mjs')
        for (const [id, item] of items) {
            const newItem = new BudgetListItem(item)
            this.#children.set(id, newItem)
            newItem.renderTo(container)
        }
    }

    #updateItems(items) {
        for (const [id, child] of items) {
            this.#children.get(id).data = child
            this.#children.get(id).update()
        }
    }

    #removeItems(items) {
        for (const [id, child] of items) {
            child.exterminate()
            this.#children.delete(id)
        }
    }

    async exterminate() {
        Store.unsubscribe('budgets', this.update)
        await super.exterminate()
    }

    listeners = new Set([
        {
            selector: '#budgets-list__items',
            event: 'click',
            handler: this.#handleItemClick,
        },
        {
            selector: '#budgets-list__items',
            event: 'contextmenu',
            handler: this.#handleItemRightClick,
        },
        {
            selector: 'button#budgets-list__menu-button',
            event: 'click',
            handler: this.#handleMenuBtnClick,
        }
    ])
}
