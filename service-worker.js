const commonPreloadMap = [
    '',
    '/',
    '/images/favicons/icon.svg',
    '/images/history-check-svgrepo-com.svg',
    '/images/trash-1-svgrepo-com.svg',
    'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js',
    'https://unpkg.com/dompurify@3.0.0/dist/purify.es.js',
    'https://fonts.googleapis.com/css?family=Neucha|Patrick+Hand+SC&display=swap',
    '/src/components/BudgetForm/BudgetForm.css',
    '/src/components/BudgetForm/BudgetForm.mjs',
    '/src/components/InviteDialog/InviteDialog.css',
    '/src/components/InviteDialog/InviteDialog.mjs',
    '/src/constants/currencies.mjs',
    '/src/constants/routes.mjs',
    '/src/constants/userStatuses.mjs',
    '/src/containers/Alert/Alert.css',
    '/src/containers/Alert/Alert.mjs',
    '/src/containers/BudgetDetails/BudgetDetails.css',
    '/src/containers/BudgetDetails/BudgetDetails.mjs',
    '/src/containers/BudgetDetails/components/Settings/BudgetSettings.css',
    '/src/containers/BudgetDetails/components/Settings/BudgetSettings.mjs',
    '/src/containers/BudgetList/BudgetList.css',
    '/src/containers/BudgetList/BudgetList.mjs',
    '/src/containers/BudgetListItem/BudgetListItem.css',
    '/src/containers/BudgetListItem/BudgetListItem.mjs',
    '/src/containers/Dialog/Dialog.css',
    '/src/containers/Dialog/Dialog.mjs',
    '/src/containers/Features/Features.css',
    '/src/containers/Features/Features.mjs',
    '/src/containers/Menu/Menu.css',
    '/src/containers/Menu/Menu.mjs',
    '/src/containers/NewBudget/NewBudget.css',
    '/src/containers/NewBudget/NewBudget.mjs',
    '/src/containers/ParticipantsList/ParticipantsList.css',
    '/src/containers/ParticipantsList/ParticipantsList.mjs',
    '/src/containers/ParticipantsListItem/ParticipantsListItem.css',
    '/src/containers/ParticipantsListItem/ParticipantsListItem.mjs',
    '/src/containers/Settings/Settings.css',
    '/src/containers/Settings/Settings.mjs',
    '/src/containers/TransactionsList/TransactionsList.css',
    '/src/containers/TransactionsList/TransactionsList.mjs',
    '/src/containers/TransactionsListItem/TransactionsListItem.css',
    '/src/containers/TransactionsListItem/TransactionsListItem.mjs',
    '/src/core/AuthManager.mjs',
    '/src/core/Component.mjs',
    '/src/core/CrisisManager.mjs',
    '/src/core/FeatureDetector.mjs',
    '/src/core/LayoutManager.mjs',
    '/src/core/ListComponent.mjs',
    '/src/core/RequestManager.mjs',
    '/src/core/Router.mjs',
    '/src/core/SettingsManager.mjs',
    '/src/core/Store.mjs',
    '/src/layouts/Login/LoginLayout.css',
    '/src/layouts/Login/LoginLayout.mjs',
    '/src/layouts/Main/MainLayout.css',
    '/src/layouts/Main/MainLayout.mjs',
    '/src/layouts/Settings/SettingsLayout.css',
    '/src/layouts/Settings/SettingsLayout.mjs',
    '/src/utils/polyfills/importAssert.mjs',
    '/src/utils/polyfills/importLegacy.mjs',
    '/src/utils/polyfills/URLPattern.mjs',
    '/src/utils/imports.js',
    '/src/utils/importWasm.mjs',
    '/src/utils/transactionsUtils.mjs',
    '/src/utils/utils.mjs',
    '/src/utils/wasm_exec.js',
    '/src/utils/go-qr-code-generator.wasm',
    '/src/App.mjs',
    '/styles/generated/sizes.css',
    '/styles/App.css',
    '/styles/paper.min.css',
]

self.addEventListener('install', (event) => {
    console.log('Service worker is installed.')
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
    event.waitUntil(self.registration?.navigationPreload.enable())
    console.log('Service worker is activated')
    start()
})

self.addEventListener('message', (context) => {
    const shouldUpdateCache = context.data.shouldUpdateCache
    start(shouldUpdateCache)
})

self.addEventListener('fetch', (event) => {
    const url = event.request.url.replace(location.origin, '')
    const isNavigation = event.request.mode === 'navigate'
    event.respondWith(caches.open('rosplatacache')
        .then(cache => {
            if (isNavigation) {
                return cache.match('/')
            } else {
                return cache.match(url)
            }
        })
        .then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            } else {
                return fetch(event.request)
            }
        }))
})

async function start(shouldUpdateCache = false) {
    const cache = await caches.open('rosplatacache')
    if (shouldUpdateCache) {
        console.log('Updating cached source code')
        commonPreloadMap.forEach(resource => {
            cache.delete(resource)
        });
        cache.addAll(commonPreloadMap)
    } else {
        // ...
        console.log('OK GO')
    }
}
