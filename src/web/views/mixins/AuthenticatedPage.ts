import Component, { mixins } from 'vue-class-component'
import { VuexAccessor } from './VuexAccessor'

import { AppContext } from '@web/entryServer'

@Component
export class AuthenticatedPage extends mixins(VuexAccessor) {
    serverPrefetch(): void {
        const ssrContext = this.$ssrContext as AppContext
        const session = ssrContext.req.session

        if (!session.currentUser) {
            console.warn('[AuthenticatedPage]', 'User is not logged in')
            ssrContext.statusCode = 403
        }
    }

    async mounted(): Promise<void> {
        try {
            await this.fetchUser()
        } catch (err) {
            this.logoutUser()
            await this.$router.push('/')
        }
    }
}
