import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import { getAuth, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js'
import { RequestManager } from './RequestManager.mjs';
import { SettingsManager } from './SettingsManager.mjs';
import { Store } from './Store.mjs';

const firebaseConfig = {
    apiKey: "AIzaSyCpPz_8duNVNfVhWp81BV6HHORussPUPLg",
    authDomain: "rosplata.firebaseapp.com",
    projectId: "rosplata",
    storageBucket: "rosplata.appspot.com",
    messagingSenderId: "1094687239432",
    appId: "1:1094687239432:web:cbeac235d80daee660d0bd"
};

const UsersApi = new RequestManager('users')
class CAuthManager {
    #isLoggedIn = false
    /**
     * @type{{
            id: string;
            name: string;
            token: string;
            picture: string;
        }}
     */
    #data = {}

    #gApp
    #gAuth
    #gProvider

    constructor() {
        if (SettingsManager.offlineMode) {
            this.#isLoggedIn = true
            debugger
            this.#data = Store.get('user')
        }
    }

    get isLoggedIn() {
        return this.#isLoggedIn
    }

    set isLoggedIn(val) {
        if (this.#isLoggedIn !== val) {
            if (val === true) {
                this.onLogin()
            } else {
                this.onLogout()
            }

            this.#isLoggedIn = val
        }
    }

    get data() {
        return this.#data
    }

    onLogin() {
        throw new Error('onLogin is not implemented')
    }

    onLogout() {
        throw new Error('onLogout is not implemented')
    }

    start = () => {
        return new Promise((resolve) => {
            this.#gApp = initializeApp(firebaseConfig)
            this.#gAuth = getAuth(this.#gApp)
            if (SettingsManager.autoLoginEnabled) {
                this.#gAuth.onAuthStateChanged(async () => {
                    if (this.#gAuth.currentUser?.uid) {
                        this.isLoggedIn = true
                        this.#data = {
                            id: this.#gAuth.currentUser.uid,
                            name: this.#gAuth.currentUser.displayName,
                            token: await this.#gAuth.currentUser.getIdToken(),
                        }
                        Store.set('user', this.#data)
                    }
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    requestDemoAccess() {
        this.isLoggedIn = true
        this.#data = {
            id: 'rosplataapp',
            name: 'Demo Account',
            token: 'demoaccount',
        }
        Store.set('user', this.#data)
    }

    login = async () => {
        try {
            this.#gProvider = new GoogleAuthProvider()
            await setPersistence(this.#gAuth, browserSessionPersistence)
            const result = await signInWithPopup(this.#gAuth, this.#gProvider)
            this.#data = {
                id: result.user.uid,
                name: result.user.displayName,
                token: result.user.accessToken,
                picture: result.user.photoURL,
            }
            Store.set('user', this.#data)
            if (await this.validate()) {
                this.isLoggedIn = true
            }
        } catch (error) {
            console.error(error)
        }
    }

    validate() {
        if (SettingsManager.offlineMode) {
            return true
        }
        try {
            UsersApi.post('validate', 'users/validate').then(({ lang }) => {
                if (SettingsManager.language !== lang) {
                    SettingsManager.language = lang
                }
            })
        } catch (er) {
            this.isLoggedIn = false
            return false
        }
        return true
    }

    logout = async () => {
        this.onLogout()
        this.isLoggedIn = false
        this.#data = null
        SettingsManager.reset()
        signOut(this.#gAuth)
        Store.set('token', '')
    }

}

export const AuthManager = new CAuthManager()
