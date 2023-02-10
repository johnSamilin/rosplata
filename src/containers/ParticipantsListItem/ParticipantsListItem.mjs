//@ts-check

import { importStyle } from "../../utils/imports.js";
import { RequestManager } from "../../core/RequestManager.mjs";
import { Component } from "../../core/Component.mjs";
import { PARTICIPANT_STATUSES_NAMES } from "../../constants/userStatuses.mjs";

importStyle('/src/containers/ParticipantsListItem/ParticipantsListItem.css')

const template = document.querySelector('template#participants-list-item-template')
const Api = new RequestManager('participants')

export class ParticipantsListItem extends Component {
    containerId = 'participants-list-item'
    baseCssClass = 'participants-list-item'

    constructor(data) {
        super()
        this.isReady = false
        this.data = data
        this.isReady = true
    }

    exterminate() {
        return super.exterminate()
    }

    renderTo(parent) {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        this.update(container)
        parent.appendChild(container)
    }

    update = async (target) => {
        const container = target ?? this.getContainer()
        if (!this.data) {
            return
        }
        
        this.setAttr(container, `.${this.getCssClass('name')}`, 'textContent', this.data.user.name)
        this.setAttr(container, `.${this.getCssClass('status')}`, 'textContent', PARTICIPANT_STATUSES_NAMES[this.data.status])
    }

    listeners = new Set([])
}
