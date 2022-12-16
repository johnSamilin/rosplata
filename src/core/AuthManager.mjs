import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import { getAuth, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js'
import { SettingsManager } from './SettingsManager.mjs';

const firebaseConfig = {
    apiKey: "AIzaSyCpPz_8duNVNfVhWp81BV6HHORussPUPLg",
    authDomain: "rosplata.firebaseapp.com",
    projectId: "rosplata",
    storageBucket: "rosplata.appspot.com",
    messagingSenderId: "1094687239432",
    appId: "1:1094687239432:web:cbeac235d80daee660d0bd"
};

class CAuthManager {
    #isLoggedIn = false
    #data

    #gApp
    #gAuth
    #gProvider

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
                this.#gAuth.onAuthStateChanged(() => {
                    if (this.#gAuth.currentUser?.uid) {
                        this.isLoggedIn = true
                    }
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    login = async () => {
        try {
            this.#gProvider = new GoogleAuthProvider()
            await setPersistence(this.#gAuth, browserSessionPersistence)
            const result = await signInWithPopup(this.#gAuth, this.#gProvider)
            const credential = GoogleAuthProvider.credentialFromResult(result)
            const token = credential.accessToken
            const user = result.user
            this.isLoggedIn = true
        } catch (error) {
            console.error(error)
        }
    }

    logout = async () => {
        this.onLogout()
        this.isLoggedIn = false
        this.#data = null
        signOut(this.#gAuth)
    }

}

export const AuthManager = new CAuthManager()
