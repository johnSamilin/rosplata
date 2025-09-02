//@ts-check

import { ListComponent } from "../../../shared/ui/list-component";
import { importStyle } from "../../../shared/lib/imports";
import { RequestManager } from "../../../shared/api/request-manager";
import { PARTICIPANT_STATUSES } from "../../../shared/config/user-statuses";
import { Store } from "../../../shared/lib/store";

importStyle('/src/widgets/participants-list/ui/participants-list-widget.css')

const template = document.querySelector('template#participants-list-template')
const Api = new RequestManager('participants')

export class ParticipantsListWidget extends ListComponent {
    containerId = 'participants-list'
    baseCssClass = 'participants-list'

    async importListItemComponent() {
        const { ParticipantListItem } = await import('../../../entities/participant/ui/participant-list-item')
        return ParticipantListItem
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
            await Api.post(
                'changeStatus',
                `budgets/${budgetId}/participant/${targetUserId}`,
                {
                    body: {
                        status,
                    }
                }
            )
            this.data[targetUserId] = {
                ...this.data[targetUserId],
                status,
            }
            this.update()
            const newParticipants = (Store.get(`budgets.${budgetId}.participants`) ?? []).map(p => {
                if (p.userId === targetUserId) {
                    p.status = status
                }
                return p
            })
            Store.set(`budgets.${budgetId}.participants`, newParticipants)
        } catch (er) {
            const { Alert } = await import('../../../shared/ui/alert')
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