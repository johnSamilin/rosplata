// @ts-check
import { getListDataDiff, mapArrayToObjectId } from '../../utils/utils.mjs'
import { Store } from '../../core/Store.mjs'
import { importStyle } from '../../utils/imports.js'
import { RequestManager } from '../../core/RequestManager.mjs'
import { Router } from '../../core/Router.mjs'
import { PARTICIPANT_STATUSES } from '../../constants/userStatuses.mjs'
import { ListComponent } from '../../core/ListComponent.mjs'

importStyle('/src/containers/BudgetList/BudgetList.css')

const template = document.querySelector('template#budgets-list-template')

const Api = new RequestManager('budgets')

export class BudgetList extends ListComponent {
    containerId = 'budgets-list'
    baseCssClass = 'budgets-list'

    constructor() {
        super()
        Store.subscribe('budgets', this.#onBudgetsUpdated)
    }

    #handleItemClick = async (event) => {
        const clickedItemId = event.target.closest('.budgets-list-item')?.dataset.id
        const clickedItem = this.children.get(clickedItemId)
        if (!clickedItem) {
            return
        }
        const { Router } = await import('../../core/Router.mjs')
        Router.navigate(`/budgets/${clickedItem.id}`)
    }

    #onBudgetsUpdated = (newData) => {
        this.data = newData
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

        const budgets = Store.get('budgets')
        this.data = budgets

        try {
            const data = await Api.get('list', 'budgets')
            if (data !== undefined) {
                Store.set('budgets', mapArrayToObjectId(data))
            }
        } catch (er) {
            console.error(er)
        } finally {
            this.isInProgress = false
        }
    }

    async addItems(items) {
        const container = this.getContainer()?.querySelector('#budgets-list__items')
        const { BudgetListItem } = await import('../BudgetListItem/BudgetListItem.mjs')
        let currentStatus = PARTICIPANT_STATUSES.UNKNOWN
        let statusContainer = container
        for (const [id, item] of items) {
            if (item.currentUserStatus === PARTICIPANT_STATUSES.UNKNOWN) {
                continue
            }
            if (currentStatus !== item.currentUserStatus) {
                currentStatus = item.currentUserStatus
                statusContainer = container?.querySelector(`.budgets-list__items-container--status${currentStatus}`)
                statusContainer?.classList.remove('budgets-list__items-container--empty')
            }
            const newItem = new BudgetListItem(item)
            this.children.set(id, newItem)
            newItem.renderTo(statusContainer)
        }
    }

    async exterminate() {
        Store.unsubscribe('budgets', this.#onBudgetsUpdated)
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
