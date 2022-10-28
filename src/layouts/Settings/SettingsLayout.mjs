//@ts-check
import { Component } from '../../core/Component.mjs'
import { importStyle } from '../../utils/imports.js'
import { Menu } from '../../containers/Menu/Menu.mjs'
import { Features } from '../../containers/Features/Features.mjs'

importStyle('/src/layouts/Settings/SettingsLayout.css')

let menuController
let featuresController

const template = document.querySelector('template#layout-settings-template')

export class SettingsLayout extends Component {
    containerId = 'layout-settings'

    async renderTo(parent) {
        menuController = new Menu()
        featuresController = new Features()
        //@ts-ignore
        const content = template.content.cloneNode(true)
        parent?.appendChild(content)
        const contentContainer = parent?.querySelector(`#${this.containerId}`)
        featuresController.renderTo(contentContainer?.querySelector('#settings'))
        menuController.renderTo(contentContainer?.querySelector('#menu'))
        this.attachListeners()
    }

    exterminate = async () => {
        await Promise.all([
            featuresController.exterminate(),
            menuController.exterminate(),
        ])
        super.exterminate()
    }
}
