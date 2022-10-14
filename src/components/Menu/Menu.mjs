// @ts-check
import { Component } from '../../utils/Component.mjs'
import { debounce, getListDataDiff } from '../../utils/listDataHelpers.mjs'

let instance
const template = document.querySelector('template#budget-list-template')

export class Menu extends Component {
    #data = []
    #children = []

    constructor() {
        super()
        if (instance) {
            return instance
        }
        instance = this
        this.containerId = 'budgets-list'
    }

    #handleItemClick = (event) => {
        const clickedItemId = event.target.closest('.budget-list-item')?.id
        const clickedItem = this.#children.find(item => item.containerId === clickedItemId)
        if (!clickedItem) {
            return
        }
        // clickedItem?.exterminate()
        clickedItem.data.title = 'test'
        clickedItem.update()
    }

    #handleItemRightClick = (event) => {
        event.preventDefault()
        const clickedItemId = event.target.closest('.budget-list-item')?.id
        const clickedItem = this.#children.find(item => item.containerId === clickedItemId)
        clickedItem?.exterminate()
    }

    #handleFilterChange = debounce((event) => {
        const search = event.target.value.trim()
        const { enter, exit, update } = getListDataDiff(
            this.#children,
            this.#data.filter(({ title }) => title.includes(search))
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
        console.log('create menu');
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
            async ([products, { BudgetListItem }]) => {
                const container = this.getContainer()
                container?.classList.remove('loading')

                this.attachListeners()

                const data = (await products.json()).products
                this.#data = data
                this.#children = data.map(budget => new BudgetListItem(budget))
                this.update()
            }
        ).catch((er) => console.error(er))

        return container
    }

    update(target) {
        const container = target ?? this.getContainer()
        this.#children.map(item => {
            container.querySelector('#budget-list-items').appendChild(item.render())
        })
    }

    //@ts-ignore
    listeners = new Set([
        {
            event: 'click',
            handler: this.#handleItemClick,
        },
        {
            event: 'contextmenu',
            handler: this.#handleItemRightClick,
        },
        {
            selector: 'input#budget-list-filter-input',
            event: 'keyup',
            handler: this.#handleFilterChange,
        }
    ])
}
