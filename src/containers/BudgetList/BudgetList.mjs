// @ts-check
import { Component } from '../../utils/Component.mjs'
import { debounce, getListDataDiff } from '../../utils/listDataHelpers.mjs'
import { Store } from '../../utils/Store.mjs'

let instance
const template = document.querySelector('template#budget-list-template')

export class BudgetList extends Component {
    #children = new Map()
    containerId = 'budget-list'

    constructor() {
        super()
        if (instance) {
            return instance
        }
        instance = this
        Store.subscribe('budgets', this.update)
    }

    #handleItemClick = async (event) => {
        const clickedItemId = parseInt(event.target.closest('.budget-list-item')?.dataset.id, 10)
        const clickedItem = this.#children.get(clickedItemId)
        if (!clickedItem) {
            return
        }
        const { Router } = await import('../../utils/Router.mjs')
        Router.navigate(`/budgets/${clickedItem.id}`)
    }

    #handleItemRightClick = (event) => {
        event.preventDefault()
        const clickedItemId = event.target.closest('.budget-list-item')?.id
        const clickedItem = this.#children.get(clickedItemId)
        clickedItem?.exterminate()
        this.#children.delete(clickedItemId)
    }

    #handleMenuBtnClick = async (event) => {
        event.preventDefault()
        event.target.classList.add('loading')
        const { Dialog } = await import('../Dialog/Dialog.mjs')
        const { Menu } = await import('../Menu/Menu.mjs')
        const menuController = new Menu()
        Dialog.render(menuController.render())
        Dialog.show()
        Dialog.getContainer()?.classList.add('feature-detector')
        event.target.classList.remove('loading')
    }

    #handleFilterChange = debounce((event) => {
        const search = event.target.value.trim()
        const { exit, update } = getListDataDiff(
            this.#children,
            [...this.#children.values()].filter(({ data }) => data.title.includes(search))
        )
        
        for (const [, child] of exit) {
            child.hide()
        }
        this.#children.forEach(child => {
            if (update.has(child.id)) {
                child.show()
            }
        })
    }, 300)

    async render() {
        if (!template) {
            throw new Error('#budget-list must be present in the HTML!')
        }

        //@ts-ignore
        const container = template.content.cloneNode(true)

        const asyncOps = [
            fetch('https://dummyjson.com/products?limit=100'),
            import('../BudgetListItem/BudgetListItem.mjs')
        ]

        this.getContainer()?.classList.add('loading')

        Promise.all(asyncOps).then(
            async ([products]) => {
                const container = this.getContainer()
                container?.classList.remove('loading')

                this.attachListeners()

                const data = (await products.json()).products
                Store.set('budgets', data)
            }
        ).catch((er) => console.error(er))

        return container
    }

    update = async (newData) => {
        const { enter, exit, update } = getListDataDiff(this.#children, newData)
        const container = this.getContainer()?.querySelector('#budget-list__items')
        const { BudgetListItem } = await import('../BudgetListItem/BudgetListItem.mjs')
        
        for (const [id, child] of exit) {
            child.exterminate()
            this.#children.delete(id)
        }
        for (const [id, item] of enter) {
            const newItem = new BudgetListItem(item)
            this.#children.set(id, newItem)
            container?.appendChild(newItem.render())
        }
        for (const [id, child] of update) {
            this.#children.get(id).data = child
            this.#children.get(id).update()
        }
    }

    async exterminate() {        
        Store.unsubscribe('budgets', this.update)
        await super.exterminate()
    }

    listeners = new Set([
        {
            selector: '#budget-list__items',
            event: 'click',
            handler: this.#handleItemClick,
        },
        {
            selector: '#budget-list__items',
            event: 'contextmenu',
            handler: this.#handleItemRightClick,
        },
        {
            selector: 'input#budget-list-filter-input',
            event: 'keyup',
            handler: this.#handleFilterChange,
        },
        {
            selector: 'button#budget-list__menu-button',
            event: 'click',
            handler: this.#handleMenuBtnClick,
        }
    ])
}
