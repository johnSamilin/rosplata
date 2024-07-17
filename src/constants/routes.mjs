export const BASE_URL = ''

export const ROUTES = [
    { pattern: BASE_URL + '/', layout: 'main', isPrivate: true },
    { pattern: BASE_URL + '/(demo)', layout: 'main', isPrivate: false },
    { pattern: BASE_URL + '/create', layout: 'main', params: { create: true }, isPrivate: true },
    { pattern: BASE_URL + '/budgets/:id', layout: 'main', isPrivate: true },
    { pattern: BASE_URL + '/settings/:section?', layout: 'settings', isPrivate: true },
    { pattern: BASE_URL + '/uikit', layout: 'uikit', isPrivate: false },
]

