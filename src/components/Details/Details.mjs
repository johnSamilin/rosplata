//@ts-check
// @ts-ignore
import DetailsStyles from '../styles/Details.css' assert { type: 'css' }

document.adoptedStyleSheets.push(DetailsStyles)

let instance

export class Details {
    constructor() {
        if (instance) {
            return this
        }
        instance = true
    }

    render() {

    }
}
