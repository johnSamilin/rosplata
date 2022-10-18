// @ts-check
import { BudgetList } from './containers/BudgetList/BudgetList.mjs'
import { BudgetDetails } from './containers/BudgetDetails/BudgetDetails.mjs'

const budgetListController = new BudgetList()
document.querySelector('#budget-list')?.appendChild(await budgetListController.render())
const budgetDetailsController = new BudgetDetails()
document.querySelector('#budget-details')?.appendChild(budgetDetailsController.render())
