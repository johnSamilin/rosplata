//@ts-check

import { SettingsManager } from "./SettingsManager.mjs"

function seal(element) {
    if (element) {
        element.classList.add('exit')
        element.classList.add('hidden')
        element.inert = true
    }
}

function unseal(element) {
    if (element) {
        element.classList.remove('exit')
        element.classList.remove('hidden')
        element.inert = false
    }
}

export class Component {
    containerId
    /**
     * Set<{
            selector: string,
            event: string,
            handler: Function,
        }>
     */
    listeners = new Set()
    baseCssClass = ''
    #data
    isReady = true
    isActive = true
    
    set data(val) {
        this.#data = val
        if (this.isReady) {
            this.update()
        }
    }

    get data() {
        return this.#data
    }

    update() {}

    getCssClass(block, modifiers) {
        let className = `${this.baseCssClass}`
        if (block) {
            className += `__${block}`
        }
        if (Array.isArray(modifiers)) {
            className += modifiers.map(mod => ` ${className}--${mod}`).join(' ')
        } else if (modifiers?.length) {
            className += `--${modifiers}`
        }

        return className
    }

    getBemClass(block, modifiers) {
        let className = this.getCssClass(block)
        if (modifiers) {
            className += ' '
            className += this.getCssClass(block, modifiers)
        }

        return className
    }

    addCssClassConditionally(condition, className, node) {
        const container = node ? node : this.getContainer()
        const classNames = className.split(' ')
        if (condition) {
            classNames.forEach(name => container?.classList.add(name))
        } else {
            classNames.forEach(name => container?.classList.remove(name))
        }
    }

    addCssClass(className, node) {
        this.addCssClassConditionally(true, className, node)
    }

    getContainer() {
        return document.getElementById(this.containerId)
    }

    stopListeners() {
        const container = this.getContainer()
        for (const listener of this.listeners) {
            const targets = listener.selector
                ? container?.querySelectorAll(listener.selector)
                : [container]
            targets?.forEach(target => target?.removeEventListener(listener.event, listener.handler))
        }
    }

    attachListeners() {
        const container = this.getContainer()
        for (const listener of this.listeners) {
            const targets = listener.selector
                ? container?.querySelectorAll(listener.selector)
                : [container]
            targets?.forEach(target => target.addEventListener(listener.event, listener.handler))
        }
    }

    hide() {
        this.isActive = false
        const container = this.getContainer()
        return new Promise((resolve) => {
            seal(container)
            resolve(true)
        })
    }

    show() {
        this.isActive = true
        const container = this.getContainer()
        return new Promise((resolve) => {
            unseal(container)
            resolve(true)
        })
    }

    async exterminate() {
        this.stopListeners()
        await this.hide()
        this.getContainer()?.remove()
    }

    async clear() {
        this.stopListeners()
        const container = this.getContainer()
        container ? container.innerHTML = '' : null
    }

    setAttr(container, selector, attribute, value, hideIfEmpty = false) {
        const node = selector ? container.querySelector(selector) : container
        if (value) {
            switch (attribute) {
                case 'textContent':
                    node.textContent = value
                    break;
                default:
                    node.setAttribute(attribute, value)
            }
            unseal(node)
            return true
        }

        if (hideIfEmpty) {
            seal(node)
        }
    }
}

export class AnimatedComponent extends Component {

    hide() {
        const container = this.getContainer()
        return new Promise((resolve) => {
            const onTransitionEnd = () => {
                seal(container)
                clearEvents()
                resolve(true)
            }
            const clearEvents = () => {
                container?.removeEventListener('transitionend', onTransitionEnd)
                container?.removeEventListener('transitioncancel', onTransitionEnd)
            }
            if (!SettingsManager.animationsEnabled) {
                container?.classList.add('exit')
                resolve(true)
                return
            }
            if (container?.classList.contains('exit')) {
                clearEvents()
                resolve(false)
                return
            }
            container?.addEventListener('transitionend', onTransitionEnd, { once: true })
            container?.addEventListener('transitioncancel', onTransitionEnd)
            container?.classList.add('exit')
        })
    }

    show() {
        const container = this.getContainer()
        return new Promise((resolve) => {
            const onTransitionEnd = () => {
                clearEvents()
                resolve(true)
            }
            const clearEvents = () => {
                container?.removeEventListener('transitionend', onTransitionEnd)
                container?.removeEventListener('transitioncancel', onTransitionEnd)
            }
            if (!SettingsManager.animationsEnabled) {
                unseal(container)
                resolve(true)
                return
            }
            if (!container?.classList.contains('exit')) {
                clearEvents()
                resolve(false)
                return
            }
            container?.addEventListener('transitionend', onTransitionEnd, { once: true })
            container?.addEventListener('transitioncancel', onTransitionEnd)
            unseal(container)
        })
    }
}
