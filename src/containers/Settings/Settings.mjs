//@ts-check
import { Component } from '../../core/Component.mjs'
import { SettingsManager } from '../../core/SettingsManager.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/containers/Settings/Settings.css')

const itemTemplate = document.querySelector('template#settings-section-item-template')

export class Settings extends Component {
    containerId = 'layout-settings__settings'

    constructor() {
        super()
    }

    renderTo(parentContainer) {
        if (!itemTemplate) {
            throw new Error('Template for settings not found!')
        }
        const animationsContainer = itemTemplate.content.cloneNode(true)
        const animationsName = animationsContainer.querySelector('.settings-item__name')
        animationsName.textContent = 'Enable animations'
        animationsName.setAttribute('for', 'animations')
        const animations = animationsContainer.querySelector('.settings-item__value')
        animations.setAttribute('type', 'checkbox')
        animations.setAttribute('id', 'animations-setting') 
        animations.setAttribute('checked', SettingsManager.animationsEnabled)
        animations.setAttribute('name', 'animations')
        parentContainer.appendChild(animationsContainer)
        this.attachListeners()
    }

    #toggleAnimations = (evt) => {
        const isEnabled = evt.target.checked
        SettingsManager.animationsOverridden = true
        SettingsManager.animationsEnabled = isEnabled
    }

    listeners = new Set([
        {
            selector: '#animations-setting',
            event: 'change',
            handler: this.#toggleAnimations,
        }
    ])
}
