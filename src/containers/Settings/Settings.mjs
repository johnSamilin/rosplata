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
        const animationsContainer = this.createSetting('Enable animations', SettingsManager.animationsEnabled, 'animations')
        const autoLoginContainer = this.createSetting('Enable auto login', SettingsManager.autoLoginEnabled, 'autologin')
        parentContainer.appendChild(animationsContainer)
        parentContainer.appendChild(autoLoginContainer)
        this.attachListeners()
    }

    createSetting(title, initialValue, name) {
        const settingContainer = itemTemplate.content.cloneNode(true)
        const settingName = settingContainer.querySelector('.settings-item__name')
        settingName.textContent = title
        settingName.setAttribute('for', name)
        const setting = settingContainer.querySelector('.settings-item__value')
        setting.setAttribute('type', 'checkbox')
        setting.setAttribute('id', `${name}-setting`)
        setting.checked = initialValue
        setting.setAttribute('name', name)

        return settingContainer
    }

    #toggleAnimations = (evt) => {
        const isEnabled = evt.target.checked
        SettingsManager.override('animationsEnabled', isEnabled)
    }

    #toggleAutologin = (evt) => {
        const isEnabled = evt.target.checked
        SettingsManager.override('autoLoginEnabled', isEnabled)
    }

    listeners = new Set([
        {
            selector: '#animations-setting',
            event: 'change',
            handler: this.#toggleAnimations,
        },
        {
            selector: '#autologin-setting',
            event: 'change',
            handler: this.#toggleAutologin,
        }
    ])
}
