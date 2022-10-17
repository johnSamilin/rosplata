// @ts-check
// import AppStyle from "../styles/App.css" assert { type: 'css' }
import { Features } from './containers/Features/Features.mjs'

const featuresController = new Features()
document.querySelector('#features')?.appendChild(featuresController.render())
