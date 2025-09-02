//@ts-check
import { AuthManager } from '../../../shared/lib/auth'
import { Component } from '../../../shared/ui/base'
import { SettingsManager } from '../../../shared/lib/settings'
import { importStyle } from '../../../shared/lib/imports'

importStyle('/src/pages/login/ui/login-page.css')

const template = document.querySelector('template#layout-login-template')

export class LoginPage extends Component {
    containerId = 'layout-login'

    renderTo(parent) {
        //@ts-ignore
        const content = template.content.firstElementChild.cloneNode(true)
        parent?.appendChild(content)
        this.setAttr(content, `.${this.getCssClass('version')}`, 'textContent', SettingsManager.appVersion)
        this.attachListeners()
    }

    handleLogin = () => {
        AuthManager.login()
    }

    listeners = new Set([
        {
            selector: 'button#login__google',
            event: 'click',
            handler: this.handleLogin,
        }
    ])
}