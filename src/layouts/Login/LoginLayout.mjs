//@ts-check
import { Component } from '../../core/Component.mjs'
import { importStyle } from '../../utils/imports.js'

importStyle('/src/layouts/Login/LoginLayout.css')

const template = document.querySelector('template#layout-login-template')

export class LoginLayout extends Component {
    containerId = 'layout-login'

    renderTo(parent) {
        //@ts-ignore
        const content = template.content.cloneNode(true)
        parent?.appendChild(content)
    }
}
