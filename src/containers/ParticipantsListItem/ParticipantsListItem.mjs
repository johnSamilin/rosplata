//@ts-check

import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { Component } from "../../core/Component.mjs";
import { PARTICIPANT_STATUSES, PARTICIPANT_STATUSES_NAMES } from "../../constants/userStatuses.mjs";
import { Store } from "../../core/Store.mjs";
import { AuthManager } from "../../core/AuthManager.mjs";

importStyle('/src/containers/ParticipantsListItem/ParticipantsListItem.css')

const template = document.querySelector('template#participants-list-item-template')
const Api = new RequestManager('participants')

export class ParticipantsListItem extends Component {
    baseCssClass = 'participants-list-item'

    constructor(data) {
        super()
        this.isReady = false
        /** @type {{
         * userId: string;
         * status: number;
         * user: { name: string; picture: string; }
         * }} */

        this.data = data
        this.containerId = `participants-list-item-${data.userId}`
        this.isReady = true
    }

    exterminate() {
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.firstElementChild.cloneNode(true)
        container.setAttribute('id', this.containerId)
        container.setAttribute('data-id', this.data.userId)
        parent.appendChild(container)
        this.update()
    }

    update = async () => {
        const container = this.getContainer()
        if (!this.data) {
            return
        }
        const selectedBudgetId = Store.get('selectedBudgetId')
        const budgetOwnerId = Store.get(`budgets.${selectedBudgetId}.userId`)
        const isOwner = budgetOwnerId === AuthManager.data.id

        this.setAttr(container, `.${this.getCssClass('name')}`, 'textContent', this.data.user.name)
        this.setAttr(container, `.${this.getCssClass('status')}`, 'textContent', PARTICIPANT_STATUSES_NAMES[this.data.status]);

        [
            PARTICIPANT_STATUSES.ACTIVE,
            PARTICIPANT_STATUSES.WAIT_APPROVAL,
            PARTICIPANT_STATUSES.BANNED
        ].forEach(status => {
            this.addCssClassConditionally(
                status !== this.data.status || !isOwner,
                'hidden',
                container.querySelector(`.${this.getCssClass('actions', `status${status}`)}`),
            )
        });
    }
}
