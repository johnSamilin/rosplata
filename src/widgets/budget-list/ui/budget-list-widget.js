// @ts-check
import { getListDataDiff, mapArrayToObjectId } from '../../../shared/lib/utils'
import { Store } from '../../../shared/lib/store'
import { importStyle } from '../../../shared/lib/imports'
import { RequestManager } from '../../../shared/api/request-manager'
import { Router } from '../../../shared/lib/router'
import { PARTICIPANT_STATUSES } from '../../../shared/config/user-statuses'
import { ListComponent } from '../../../shared/ui/list-component'

importStyle('/src/widgets/budget-list/ui/budget-list-widget.css')

const template = document.querySelector('template#budgets-list-template')

const Api = new RequestManager('budgets')

export class BudgetListWidget extends ListComponent {
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
        const { Router } = await import('../../../shared/lib/router')
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
        const [{ Dialog }, { MenuWidget }] = await Promise.all([
            import('../../../shared/ui/dialog'),
            import('../../menu'),
        ])
        const menuController = new MenuWidget()
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
        const { BudgetListItem } = await import('../../../entities/budget/ui/budget-list-item')
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