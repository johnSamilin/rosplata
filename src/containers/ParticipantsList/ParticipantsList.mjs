//@ts-check

import { ListComponent } from "../../core/ListComponent.mjs";
import { importStyle } from "../../utils/imports.js";
import { PARTICIPANT_STATUSES } from "../../constants/userStatuses.mjs";
import { Store } from "../../core/Store.mjs";
import { ParticipantsStoreAdapter } from "../../Adapters/ParticipantsStoreAdapter.mjs";

importStyle('/src/containers/ParticipantsList/ParticipantsList.css')

const template = document.querySelector('template#participants-list-template')
const participantsAdapter = new ParticipantsStoreAdapter()

export class ParticipantsList extends ListComponent {
    containerId = 'participants-list'
    baseCssClass = 'participants-list'

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

    #handleClick = async (event) => {
        if (this.isInProgress) {
            return false
        }
        this.isInProgress = true
        try {
            const isBanBtn = event.target.matches('.participants-list-item__action--ban')
            const isApproveBtn = event.target.matches('.participants-list-item__action--approve')
            const targetUserId = event.target.parentNode.parentNode.dataset.id
            const budgetId = Store.get('selectedBudgetId')
            let status
            if (isBanBtn) {
                status = PARTICIPANT_STATUSES.BANNED
            }
            if (isApproveBtn) {
                status = PARTICIPANT_STATUSES.ACTIVE
            }
            participantsAdapter.updateItem(budgetId, targetUserId, { status })
        } catch (er) {
            const { Alert } = await import('../../components/Alert/Alert.mjs')
            new Alert('danger', 'Hmm, seems like you cannot do this')
            console.error(er)
        } finally {
            this.isInProgress = false
        }
    }

    listeners = new Set([
        {
            selector: '.participants-list__items',
            event: 'click',
            handler: this.#handleClick,
        }
    ])
}
