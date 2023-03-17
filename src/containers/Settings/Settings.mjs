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
        const animationsContainer = this.createSetting(
            'Enable animations',
            SettingsManager.animationsEnabled,
            'animations',
            'checkbox',
        )
        const autoLoginContainer = this.createSetting(
            'Enable auto login',
            SettingsManager.autoLoginEnabled,
            'autologin',
            'checkbox',
        )
        const appVersionContainer = this.createStaticSetting(
            'App version',
            SettingsManager.appVersion,
        )
        const useSystemThemeContainer = this.createSetting(
            'Theme: Same as system',
            SettingsManager.theme === 'system',
            'theme',
            'radio',
            'system',
        )
        const useLightThemeContainer = this.createSetting(
            'Theme: Light',
            SettingsManager.theme === 'light',
            'theme',
            'radio',
            'light',
        )
        const useDarkThemeContainer = this.createSetting(
            'Theme: Dark',
            SettingsManager.theme === 'dark',
            'theme',
            'radio',
            'dark',
        )
        
        ;[
            appVersionContainer,
            animationsContainer,
            autoLoginContainer,

            useSystemThemeContainer,
            useLightThemeContainer,
            useDarkThemeContainer,
        ].forEach(container => parentContainer.appendChild(container))
        this.attachListeners()
    }

    createSetting(title, initialValue, name, type, value) {
        const settingContainer = itemTemplate.content.cloneNode(true)
        const settingName = settingContainer.querySelector('.settings-item__name')
        settingName.textContent = title
        settingName.setAttribute('for', name)
        const setting = settingContainer.querySelector('.settings-item__value')
        setting.setAttribute('type', type)
        setting.setAttribute('id', `${name}-setting`)
        setting.checked = initialValue
        setting.setAttribute('name', name)
        if (type === 'radio') {
            setting.setAttribute('value', value)
        }

        return settingContainer
    }

    createStaticSetting(title, value) {
        const settingContainer = staticItemTemplate.content.cloneNode(true)
        this.setAttr(settingContainer, '.settings-item__name', 'textContent', title)
        this.setAttr(settingContainer, '.settings-item__value', 'textContent', value)

        return settingContainer
    }

    #toggleSetting = (name) => (evt) => {
        let value = evt.target.checked
        if (name === 'theme') {
            value = evt.target.value
        }
        SettingsManager.override(name, value)
    }

    listeners = new Set([
        {
            selector: '#animations-setting',
            event: 'change',
            handler: this.#toggleSetting('animationsEnabled'),
        },
        {
            selector: '#autologin-setting',
            event: 'change',
            handler: this.#toggleSetting('autoLoginEnabled'),
        },
        {
            selector: '#theme-setting',
            event: 'change',
            handler: this.#toggleSetting('theme'),
        }
    ])
}
