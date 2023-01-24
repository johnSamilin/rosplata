// @ts-check
import { AnimatedComponent } from '../../core/Component.mjs'
import { getListDataDiff, mapArrayToObjectId } from '../../utils/utils.mjs'
import { Store } from '../../core/Store.mjs'
import { importStyle } from '../../utils/imports.js'
import { RequestManager } from '../../core/RequestManager.mjs'
import { Router } from '../../core/Router.mjs'

importStyle('/src/containers/BudgetList/BudgetList.css')

const template = document.querySelector('template#budgets-list-template')

const Api = new RequestManager('budgets')

export class BudgetList extends AnimatedComponent {
    #children = new Map()
    containerId = 'budgets-list'
    baseCssClass = 'budgets-list'

    set isInProgress(val) {
        this.addCssClassConditionally(val, 'loading')
    }

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

    #handleCreateBudget = async (event) => {
        event.preventDefault()        
        Router.navigate('/create')
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
        Dialog.addCssClass('menu')
        event.target.classList.remove('loading-rotate')
    }

    async renderTo(parent) {
        if (!template) {
            throw new Error('#budgets-list must be present in the HTML!')
        }

        //@ts-ignore
        const container = template.content.cloneNode(true)

        this.isInProgress = true
        parent.appendChild(container)
        this.attachListeners()

        try {
            const data = await Api.get('list', 'budgets')
            Store.set('budgets', mapArrayToObjectId(data))
        } catch (er) {
            console.error(er)
        } finally {
            this.isInProgress = false
        }
    }

    update = async (newData) => {
        this.getContainer()?.classList.remove(this.getCssClass(null, 'empty'))
        const { enter, exit, update } = getListDataDiff(this.#children, Object.values(newData))

        this.#removeItems(exit)
        this.#updateItems(update)
        await this.#addItems(enter)
        if (this.#children.size === 0) {
            this.addCssClass(this.getBemClass(null, 'empty'))
        }
    }

    async #addItems(items) {
        const container = this.getContainer()?.querySelector('#budgets-list__items')
        const { BudgetListItem } = await import('../BudgetListItem/BudgetListItem.mjs')
        let currentStatus = '-1'
        let statusContainer = container
        for (const [id, item] of items) {
            if (currentStatus !== item.currentUserStatus) {
                currentStatus = item.currentUserStatus
                statusContainer = container?.querySelector(`.budgets-list__items--status${currentStatus}`)
                statusContainer?.classList.remove('budgets-list__items--empty')
            }
            const newItem = new BudgetListItem(item)
            this.#children.set(id, newItem)
            newItem.renderTo(statusContainer)
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
            selector: 'button#budgets-list__create-button',
            event: 'click',
            handler: this.#handleCreateBudget,
        },
        {
            selector: 'button#budgets-list__menu-button',
            event: 'click',
            handler: this.#handleMenuBtnClick,
        }
    ])
}
