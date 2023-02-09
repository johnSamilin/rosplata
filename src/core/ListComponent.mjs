// @ts-check
import { getListDataDiff } from '../utils/utils.mjs'
import { Component } from './Component.mjs'

export class ListComponent extends Component {
    children = new Map()

    /**
     * @returns {Promise<any>}
     */
    async importListItemComponent() { }

    async update() {
        this.getContainer()?.classList.remove(this.getCssClass(null, 'empty'))
        const { enter, exit, update } = getListDataDiff(this.children, Object.values(this.data))
        
        this.removeItems(exit)
        this.updateItems(update)
        await this.addItems(enter)
        if (this.children.size === 0) {
            this.addCssClass(this.getBemClass(null, 'empty'))
        }
    }

    async addItems(items) {
        const ListItemComponent = await this.importListItemComponent()
        for (const [id, item] of items) {
            const newItem = new ListItemComponent(item)
            this.children.set(id, newItem)
            newItem.renderTo(this.getContainer())
        }
    }

    updateItems(items) {
        for (const [id, child] of items) {
            this.children.get(id).data = child
            this.children.get(id).update()
        }
    }

    removeItems(items) {
        for (const [id, child] of items) {
            child.exterminate()
            this.children.delete(id)
        }
    }
}
