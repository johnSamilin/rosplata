//@ts-check
import { AnimatedComponent } from '../../../shared/ui/base'
import { importStyle } from '../../../shared/lib/imports'
import { MenuWidget } from '../../../widgets/menu'
import { Router } from '../../../shared/lib/router'

importStyle('/src/pages/settings/ui/settings-page.css')

let menuController, featuresController, settingsController

const template = document.querySelector('template#layout-settings-template')

export class SettingsPage extends AnimatedComponent {
    containerId = 'layout-settings'

    async renderTo(parent) {
        //@ts-ignore
        const content = template.content.cloneNode(true)
        parent?.appendChild(content)
        const contentContainer = parent?.querySelector(`#${this.containerId}`)
        this.renderContentTo(contentContainer)
        menuController = new MenuWidget()
        menuController.renderTo(contentContainer?.querySelector('#layout-settings__menu'))
    }

    renderContentTo(contentContainer) {
        if (Router.routeParams.section === 'features') {
            import('../../../widgets/features').then(({ FeaturesWidget }) => {
                featuresController = new FeaturesWidget()
                featuresController.renderTo(contentContainer?.querySelector('#layout-settings__settings'))
            })
        } else {
            import('../../../widgets/settings').then(({ SettingsWidget }) => {
                settingsController = new SettingsWidget()
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
            import('../../../shared/lib/crisis-manager').then(({ CrisisManager }) => {
                CrisisManager.logError(er)
            })
        } finally {
            super.exterminate()
        }
    }
}