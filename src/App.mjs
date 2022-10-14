// @ts-check
// import AppStyle from "../styles/App.css" assert { type: 'css' }
import { Menu } from './components/Menu/Menu.mjs'

const menuController = new Menu()
document.querySelector('#budgets-list')?.appendChild(await menuController.render())
