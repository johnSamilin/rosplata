// @ts-check
// import AppStyle from "../styles/App.css" assert { type: 'css' }
import { BudgetDetails } from './containers/BudgetDetails/BudgetDetails.mjs'
import { Menu } from './containers/Menu/Menu.mjs'

const menuController = new Menu()
document.querySelector('#budgets-list')?.appendChild(await menuController.render())
const detailsController = new BudgetDetails()
document.querySelector('#budget-details')?.appendChild(detailsController.render())
