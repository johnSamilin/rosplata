import { CDialog, Dialog } from '../../containers/Dialog/Dialog.mjs'
import { FeatureDetector } from '../../core/FeatureDetector.mjs'
import { importStyle } from '../../utils/imports.js'
import { importWasm } from '../../utils/importWasm.mjs'

importStyle('/src/components/InviteDialog/InviteDialog.css')
const template = document.querySelector('template#invite-dialog-template')

export class CInviteDialog extends CDialog {
    baseCssClass = 'invite-dialog'
    /**
    * @type {{ title: string; url: string; text: string }}
    */
    data

    show() {
        //@ts-ignore
        const container = template.content.firstElementChild.cloneNode(true)
        this.update(container)
        this.getContainer().appendChild(container)
        super.show()
    }

    update = async (target) => {
        const container = target ?? this.getContainer()
        if (!this.data.url) {
            return
        }
        try {
            await importWasm('/src/utils/go-qr-code-generator.wasm')
            this.setAttr(container, `.${this.getCssClass('qr-code')}`, 'src', `data:image/png;base64,${window.generateQrCode(this.data.url)}`)
        } catch (er) {
            const { Alert } = await import('../../containers/Alert/Alert.mjs')
            new Alert('danger', 'Hmm, seems like you cannot share')
            console.error(er)
        }
    }

    hide = () => {
        this.data.url = null
        super.hide()
    }

    share = async () => {
        const dataToShare = {
            url: this.data.url,
            text: this.data.text,
            title: this.data.title
        }
        if (FeatureDetector.share && navigator.canShare(dataToShare)) {
            navigator.share(dataToShare)
        } else {
            const { Alert } = await import('../../containers/Alert/Alert.mjs')
            new Alert('danger', 'Hmm, seems like you cannot share')
        }
    }

    listeners = new Set([
         ...Dialog.listeners.values(),
        {
            selector: '#send-invite-link',
            event: 'click',
            handler: this.share,
        }
    ])
}

export const InviteDialog = new CInviteDialog()
