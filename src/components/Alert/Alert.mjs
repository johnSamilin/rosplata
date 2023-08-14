// @ts-check
import { Component } from '../../core/Component.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/components/Alert/Alert.css')

const template = document.querySelector('template#alert-template')
const types = ['primary', 'secondary', 'success', 'warning', 'danger']

export class Alert extends Component {
    containerId = 'alerts'
    id

    /**
     * Shows an alert
     * @param {'primary' | 'secondary' | 'success' | 'warning' | 'danger'} type 
     * @param {string} text 
     * @param {number} timeout 
     */
    constructor(type, text, timeout = 5000) {
        super()
        if (!template) {
            throw new Error('#alerts must be present in the HTML!')
        }
        let alertType = type
        if (!(types.includes(type))) {
            alertType = 'primary'
        }

        this.id = crypto.randomUUID()

        //@ts-ignore
        const content = template.content.cloneNode(true)
        this.setAttr(content, '.alert-state', 'id', this.id)
        this.setAttr(content, '.btn-close', 'for', this.id)
        this.addCssClass(`alert-${type}`, content.querySelector('.alert'))
        this.setAttr(content, '.app-alert__text', 'textContent', text)

        this.getContainer()?.appendChild(content)
        if (timeout > 0) {
            setTimeout(this.exterminate, timeout)
        }
    }

    exterminate = async () => {
        this.getContainer()?.querySelector(`.app-alert:has(.alert-state[id='${this.id}'])`)?.remove()
    }
}
