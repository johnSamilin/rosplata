//@ts-check

import { ListComponent } from "../../core/ListComponent.mjs";
import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";

importStyle('/src/containers/ParticipantsList/ParticipantsList.css')

const template = document.querySelector('template#participants-list-template')
const Api = new RequestManager('participants')

export class ParticipantsList extends ListComponent {
    containerId = 'participants-list'
    baseCssClass = 'participants-list'
    budgetId

    constructor(budgetId) {
        super()
        this.budgetId = budgetId
    }

    async importListItemComponent() {
        const { ParticipantsListItem } = await import('../ParticipantsListItem/ParticipantsListItem.mjs')
        return ParticipantsListItem
    }

    keyAccessor = ({ userId }) => userId

    async show() {
        this.attachListeners()
        this.isActive = true
        super.show()
    }

    async hide() {
        this.stopListeners()
        this.isActive = false
        super.hide()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        parent.appendChild(container)
    }

    listeners = new Set([])
}
