import { Component, Mixins, Vue } from 'vue-property-decorator'

import { mapActions, mapMutations, mapState } from 'vuex'
import { ErrorResponse, UserResponse } from '@api/interfaces/Responses'

@Component({
    computed: {
        ...mapState([
            'currentUser',
            'error',
        ]),
    },
    methods: {
        ...mapMutations([
            'logoutUser',
            'setCurrentUser',
            'setError',
        ]),
        ...mapActions([
            'fetchUser',
        ]),
    },
})
export class VuexAccessor extends Mixins(Vue) {
    currentUser?: UserResponse
    error?: ErrorResponse

    logoutUser!: () => void
    setCurrentUser!: (currentUser: UserResponse) => void
    setError!: (error?: ErrorResponse) => void

    fetchUser!: () => Promise<void>
}
