//@ts-check
import { AnimatedComponent } from '../../core/Component.mjs'
import { importStyle } from '../../utils/imports.js'
import { Menu } from '../../containers/Menu/Menu.mjs'
import { Router } from '../../core/Router.mjs'

importStyle('/src/layouts/Settings/SettingsLayout.css')

let menuController, featuresController, settingsController

const template = document.querySelector('template#layout-settings-template')

export class SettingsLayout extends AnimatedComponent {
    containerId = 'layout-settings'

    async renderTo(parent) {
        //@ts-ignore
        const content = template.content.cloneNode(true)
        parent?.appendChild(content)
        const contentContainer = parent?.querySelector(`#${this.containerId}`)
        this.renderContentTo(contentContainer)
        menuController = new Menu()
        menuController.renderTo(contentContainer?.querySelector('#layout-settings__menu'))
    }

    renderContentTo(contentContainer) {
        if (Router.routeParams.section === 'features') {
            import('../../containers/Features/Features.mjs')
                .then(({ Features }) => {
                    featuresController = new Features()
                    featuresController.renderTo(contentContainer?.querySelector('#layout-settings__settings'))
                })
        } else {
            import('../../containers/Settings/Settings.mjs')
                .then(({ Settings }) => {
                    settingsController = new Settings()
                    settingsController.renderTo(contentContainer?.querySelector('#layout-settings__settings'))
                })
        }
    }

    async update() {
        try {
            await Promise.all([
                featuresController?.clear(),
                settingsController?.clear(),
                menuController?.update(),
            ])
        } catch(er) {}
        this.renderContentTo(this.getContainer())
    }

    exterminate = async () => {
        try {
            await Promise.all([
                featuresController?.exterminate(),
                settingsController?.exterminate(),
                menuController.exterminate(),
            ])
        } catch (er) {
            console.error(er);
        } finally {
            super.exterminate()
        }
    }
}
