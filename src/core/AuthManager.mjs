import { parseJwt } from "../utils/utils.mjs"
import { FeatureDetector } from "./FeatureDetector.mjs"

class CAuthManager {
    #isLoggedIn = false
    #data

    get isLoggedIn() {
        return this.#isLoggedIn
    }

    get data() {
        return this.#data
    }

    onLogin() {
        throw new Exception('onLogin is not implemented')
    }

    start = async () => {
        if (FeatureDetector.federatedLogin) {
            const profile = await navigator.credentials.get({
                federated: {
                    provider: [
                        'https://accounts.google.com'
                    ]
                },
                mediation: 'silent'
            });
        }
        google.accounts.id.initialize({
            client_id: '1094687239432-p5670t7mfte768qtssg70koaf11vgp34.apps.googleusercontent.com',
            callback: this.#handleCredentialResponse
        })
        google.accounts.id.prompt(this.#handleGoogleUI)
    }

    #handleGoogleUI = (notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google auth UI is not displayed because ', notification.getNotDisplayedReason())
            this.#renderLoginButton()
        }
        if (notification.isDismissedMoment()) {
            console.log('Google auth UI is dismissed because', notification.getDismissedReason())
            this.#renderLoginButton()
        }
    }

    async #storeCredentials(profile) {
        const c = new FederatedCredential({
            id: profile.iat,
            provider: 'https://accounts.google.com',
            name: profile.name,
            iconURL: profile.picture
        });
        return navigator.credentials.store(c);
    }

    #handleCredentialResponse = async (evt) => {
        this.#isLoggedIn = true
        if (FeatureDetector.federatedLogin) {
            await this.#storeCredentials(parseJwt(evt.credential))
        }
        this.onLogin()
    }

    #renderLoginButton() {
        const loginBtn = document.querySelector('#login__google')
        google.accounts.id.renderButton(
            loginBtn,
            {
                type: 'button',
                theme: 'filled_white',
                shape: 'circular',
                text: 'Login with Google',
            }
        )
    }
}

export const AuthManager = new CAuthManager()

window.addEventListener('load', AuthManager.start)
