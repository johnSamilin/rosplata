//@ts-check
// @ts-ignore
import MenuStyles from './Menu.css' assert { type: 'css' }
import { Component } from '../../utils/Component.mjs'
import { Store } from '../../utils/Store.mjs'

document.adoptedStyleSheets.push(MenuStyles)

const template = document.querySelector('template#menu-template')

export class Menu extends Component {
    data
    id

    constructor() {
        super()
    }

    render() {
        this.stopListeners()
        if (!template) {
            throw new Error('Template for menu not found!')
        }
        // @ts-ignore
        const content = template.content.cloneNode(true)
        return content
    }
    
    update = (target) => {
        const container = target ?? this.getContainer()
    }

}
