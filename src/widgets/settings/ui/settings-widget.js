//@ts-check
import { Component } from '../../../shared/ui/base'
import { SettingsManager } from '../../../shared/lib/settings'
import { importStyle } from '../../../shared/lib/imports'

importStyle('/src/widgets/settings/ui/settings-widget.css')

const template = document.querySelector('template#settings-section-template')

export class SettingsWidget extends Component {
    containerId = 'layout-settings__settings'

    constructor() {
        super()
    }

    renderTo(parentContainer) {
        if (!template) {
            throw new Error('Template for settings not found!')
        }
        const container = template.content.cloneNode(true)
        this.setAttr(container, '#app-version', 'textContent', SettingsManager.appVersion)
        container.querySelector(`#theme-setting option[value=${SettingsManager.theme}]`).setAttribute('selected', true)
        container.querySelector(`#language-setting option[value=${SettingsManager.language}]`)?.setAttribute('selected', true)
        if (SettingsManager.autoLoginEnabled) {
            container.querySelector('#autologin-setting').setAttribute('checked', 'true')
        }
        parentContainer.appendChild(container)
        this.attachListeners()
    }

    #toggleCheckboxSetting = (name) => (evt) => {
        SettingsManager.override(name, evt.target.checked)
    }

    #toggleSelectSetting = (name) => (evt) => {
        SettingsManager.override(name, evt.target.value)
    }

    listeners = new Set([
        {
            selector: '#autologin-setting',
            event: 'change',
            handler: this.#toggleCheckboxSetting('autoLoginEnabled'),
        },
        {
            selector: '#theme-setting',
            event: 'change',
            handler: this.#toggleSelectSetting('theme'),
        },
        {
            selector: '#language-setting',
            event: 'change',
            handler: this.#toggleSelectSetting('language'),
        }
    ])
}