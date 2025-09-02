// @ts-check
import { defaultKeyAcessor, getListDataDiff } from '../lib/utils'
import { Component } from './base'

export class ListComponent extends Component {
    children = new Map()

    /**
     * @returns {Promise<any>}
     */
    async importListItemComponent() { }

    keyAccessor = defaultKeyAcessor

    async update() {
        this.getContainer()?.classList.remove(this.getCssClass(null, 'empty'))
        const { enter, exit, update } = getListDataDiff(this.children, Object.values(this.data), this.keyAccessor)
        
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
            newItem.renderTo(this.getContainer()?.querySelector(`.${this.getCssClass('items')}`))
        }
    }

    updateItems(items) {
        for (const [id, child] of items) {
            this.children.get(id).data = child
        }
    }

    removeItems(items) {
        for (const [id, child] of items) {
            child.exterminate()
            this.children.delete(id)
        }
    }
}