import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js'

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
        this.#gApp = initializeApp(firebaseConfig)
        this.#gAuth = getAuth(this.#gApp)
        this.#gProvider = new GoogleAuthProvider()
    }

    login = async () => {
        try {
            const result = await signInWithPopup(this.#gAuth, this.#gProvider)
            const credential = GoogleAuthProvider.credentialFromResult(result)
            const token = credential.accessToken
            const user = result.user
            this.isLoggedIn = true
        } catch(error) {
            console.error(error)
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
        }
    }

    logout = async () => {
        this.onLogout()
        this.isLoggedIn = false
        this.#data = null
    }

}

export const AuthManager = new CAuthManager()
