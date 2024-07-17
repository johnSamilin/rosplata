//@ts-check

class Uikit extends HTMLElement {
  root
  static observedAttributes = ["selected-element"]

  constructor() {
    const instance = super()
    this.root = instance
  }

  connectedCallback() {
    console.log("Custom element added to page.")
    const template = document.querySelector('template#uikit')
    //@ts-ignore
    const content = template.content.cloneNode(true)
    this.root.appendChild(content)

  }

  disconnectedCallback() {
    console.log("Custom element removed from page.")
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.")
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`)
  }
}

customElements.define("ui-kit", Uikit)

let element = document.createElement('ui-kit')
export class UikitLayout {
  renderTo(parent) {
    parent.appendChild(element)
  }

  exterminate() {
    document.querySelector('#layout')?.removeChild(element)
  }
}
