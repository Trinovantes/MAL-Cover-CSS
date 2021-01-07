import Component from 'vue-class-component'
import Vue from 'vue'

import { AppContext } from '@web/entryServer'
import Constants from '@common/Constants'

@Component
export class Page extends Vue {
    protected getPageTitle?: string | (() => string)

    created(): void {
        if (!Constants.IS_SSR) {
            return
        }

        const ssrContext = this.$ssrContext as AppContext
        ssrContext.title = this.docTitle
    }

    mounted(): void {
        if (Constants.IS_SSR) {
            return
        }

        document.title = this.docTitle
    }

    protected get pageTitle(): string {
        if (this.getPageTitle) {
            if (typeof this.getPageTitle === 'string') {
                return this.getPageTitle
            } else {
                return this.getPageTitle()
            }
        }

        return ''
    }

    protected get docTitle(): string {
        if (this.pageTitle) {
            return `${this.pageTitle} | ${Constants.APP_NAME}`
        } else {
            return Constants.APP_NAME
        }
    }
}
