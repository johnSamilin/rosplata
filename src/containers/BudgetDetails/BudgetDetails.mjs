//@ts-check

import { FeatureDetector } from "../../helpers/FeatureDetector.mjs";
import { Component } from "../../utils/Component.mjs";

const template = document.querySelector('template#budget-details-template')
let instance

export class BudgetDetails extends Component {
    containerId = 'budget-details'
    data = {}

    constructor(data) {
        super()
        if (instance) {
            return instance
        }
        this.data = data
        instance = this
    }

    async sync() {
        const data = await (await fetch(`https://dummyjson.com/products/${this.data.id}`)).json()
        this.data = data
        this.update()
    }

    render() {
        //@ts-ignore
        const container = template.content.cloneNode(true)
        this.update(container)
        return container
    }

    update(target) {
        const container = target ?? this.getContainer()
        this.setAttr(container, '#budget-details-title', 'textContent', this.data?.title)
        this.setAttr(container, '#budget-details-brand', 'textContent', this.data?.brand)
        this.setAttr(container, '#budget-details-category', 'textContent', this.data?.category ?? 'loading...')
        this.setAttr(container, '#budget-details-description', 'textContent', this.data?.description ?? 'loading...')
        this.setAttr(container, '#budget-details-discount', 'textContent', this.data?.discountPercentage ?? 'loading...')
        this.setAttr(container, '#budget-details-price', 'textContent', this.data?.price ?? 'loading...')
        this.setAttr(container, '#budget-details-rating', 'textContent', this.data?.rating ?? 'loading...')
        this.setAttr(container, '#budget-details-stock', 'textContent', this.data?.stock ?? 'loading...')
        const isBandwidthHigh = ['3g', '4g'].includes(FeatureDetector.connectionSpeed)
        this.setAttr(container, '#budget-details-thumbnail', 'src', isBandwidthHigh && this.data?.thumbnail, true)
    }
}
