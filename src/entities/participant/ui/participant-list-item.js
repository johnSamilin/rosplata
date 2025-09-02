//@ts-check

import { importStyle } from "../../../shared/lib/imports";
import { RequestManager } from "../../../shared/api/request-manager";
import { Component } from "../../../shared/ui/base";
import { PARTICIPANT_STATUSES, PARTICIPANT_STATUSES_NAMES } from "../../../shared/config/user-statuses";
import { Store } from "../../../shared/lib/store";
import { AuthManager } from "../../../shared/lib/auth";

importStyle('/src/entities/participant/ui/participant-list-item.css')

const template = document.querySelector('template#participants-list-item-template')
const Api = new RequestManager('participants')

export class ParticipantListItem extends Component {
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
        if (!this.data || !container) {
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