//@ts-check
import { Component } from '../../core/Component.mjs'
import { SettingsManager } from '../../core/SettingsManager.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/containers/Settings/Settings.css')

const itemTemplate = document.querySelector('template#settings-section-item-template')
const staticItemTemplate = document.querySelector('template#settings-section-static-item-template')

export class Settings extends Component {
    containerId = 'layout-settings__settings'

    constructor() {
        super()
    }

    renderTo(parentContainer) {
        if (!itemTemplate) {
            throw new Error('Template for settings not found!')
        }
        const animationsContainer = this.createCheckboxSetting('Enable animations', SettingsManager.animationsEnabled, 'animations')
        const autoLoginContainer = this.createCheckboxSetting('Enable auto login', SettingsManager.autoLoginEnabled, 'autologin')
        const appVersionContainer = this.createStaticSetting('App version', SettingsManager.appVersion)
        
        parentContainer.appendChild(appVersionContainer)
        parentContainer.appendChild(animationsContainer)
        parentContainer.appendChild(autoLoginContainer)
        this.attachListeners()
    }

    createCheckboxSetting(title, initialValue, name) {
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

    createStaticSetting(title, value) {
        const settingContainer = staticItemTemplate.content.cloneNode(true)
        this.setAttr(settingContainer, '.settings-item__name', 'textContent', title)
        this.setAttr(settingContainer, '.settings-item__value', 'textContent', value)

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
