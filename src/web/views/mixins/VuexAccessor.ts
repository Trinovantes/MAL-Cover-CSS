import Component from 'vue-class-component'
import Vue from 'vue'
import { mapActions, mapMutations, mapState } from 'vuex'
import { ErrorResponse, UserResponse } from '@web/api/interfaces/Responses'

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
export class VuexAccessor extends Vue {
    currentUser?: UserResponse
    error?: ErrorResponse

    logoutUser!: () => void
    setCurrentUser!: (currentUser: UserResponse) => void
    setError!: (error?: ErrorResponse) => void

    fetchUser!: () => Promise<void>
}
