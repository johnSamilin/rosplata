// @ts-check
import { FeatureDetector } from '../../helpers/FeatureDetector.mjs'
import { Component } from '../../utils/Component.mjs'

import FeaturesStyles from './Features.css' assert { type: 'css' }

document.adoptedStyleSheets.push(FeaturesStyles)

const containerTemplate = document.querySelector('template#feature-detector-template')
const itemTemplate = document.querySelector('template#feature-detector-feature-template')

export class Features extends Component {
    render() {        
        this.stopListeners()
        if (!containerTemplate || !itemTemplate) {
            throw new Error('Templates for features list not found!')
        }
        // @ts-ignore
        const content = containerTemplate.content.cloneNode(true)
        for (const [name, value] of FeatureDetector) {
            // @ts-ignore
            const feature = itemTemplate.content.cloneNode(true)
            this.setAttr(feature, '.feature-detector-feature-name', 'textContent', name)
            this.setAttr(feature, '.feature-detector-feature-value', 'class', `feature-detector-feature-value ${value ? 'yes' : 'no'}`)
            content.appendChild(feature)
        }
        return content
    }
}
