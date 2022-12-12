export const BASE_URL = ''

export const ROUTES = [
    { pattern: BASE_URL + '/', layout: 'main' },
    { pattern: BASE_URL + '/create', layout: 'main', params: { create: true } },
    { pattern: BASE_URL + '/budgets/:id', layout: 'main' },
    { pattern: BASE_URL + '/settings/:section?', layout: 'settings' },
]

