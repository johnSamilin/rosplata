// @ts-check
import { FeatureDetector } from '../../../shared/lib/feature-detector'
import { Component } from '../../../shared/ui/base'
import { importStyle } from '../../../shared/lib/imports'

importStyle('/src/widgets/features/ui/features-widget.css')

const containerTemplate = document.querySelector('template#feature-detector__template')
const itemTemplate = document.querySelector('template#feature-detector__feature-template')

export class FeaturesWidget extends Component {
    containerId = 'feature-detector'

    renderTo(parent) {        
        this.stopListeners()
        if (!containerTemplate || !itemTemplate) {
            throw new Error('Templates for features list not found!')
        }
        // @ts-ignore
        const content = containerTemplate.content.firstElementChild.cloneNode(true)
        for (const [name, value] of FeatureDetector) {
            // @ts-ignore
            const feature = itemTemplate.content.cloneNode(true)
            this.setAttr(feature, '.feature-detector__feature-name', 'textContent', name)
            this.setAttr(feature, '.feature-detector__feature-value', 'class', `feature-detector__feature-value--${value ? 'yes' : 'no'}`)
            content.appendChild(feature)
        }
        parent.appendChild(content)
    }
}