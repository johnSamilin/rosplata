import { CDialog, Dialog } from './dialog'
import { FeatureDetector } from '../lib/feature-detector'
import { importStyle } from '../lib/imports'
import { importWasm } from '../lib/import-wasm'

importStyle('/src/shared/ui/invite-dialog.css')
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
            const { Alert } = await import('./alert')
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
            const { Alert } = await import('./alert')
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