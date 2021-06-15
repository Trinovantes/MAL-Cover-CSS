<template>
    <header class="layout-header">
        <div class="container">
            <div class="header-logo">
                <q-btn
                    icon="menu"
                    class="expand-btn"
                    flat
                    padding="0"
                    @click="isHeaderItemsExpanded = !isHeaderItemsExpanded"
                />
                <router-link to="/" class="logo" @click="closeHeaderItems">
                    {{ APP_NAME }}
                </router-link>
            </div>

            <nav
                class="header-items"
                :class="{
                    expanded: isHeaderItemsExpanded
                }"
            >
                <router-link to="/guide" @click="closeHeaderItems">
                    Guide
                </router-link>
                <router-link to="/example" @click="closeHeaderItems">
                    Example
                </router-link>
                <router-link to="/classic-vs-modern" @click="closeHeaderItems">
                    Classic vs. Modern
                </router-link>

                <div class="hspace" />

                <ClientOnly>
                    <template v-if="currentUser">
                        <router-link to="/settings" @click="closeHeaderItems">
                            Settings
                        </router-link>

                        <div class="seperator" />

                        <q-btn
                            color="negative"
                            unelevated
                            rounded
                            no-caps
                            no-wrap
                            label="Log Out"
                            @click="logout(); closeHeaderItems()"
                        />
                    </template>
                    <template v-else>
                        <div class="seperator" />

                        <q-btn
                            color="positive"
                            unelevated
                            rounded
                            no-caps
                            no-wrap
                            label="Log In"
                            @click="login($route.path); closeHeaderItems()"
                        />
                    </template>
                </ClientOnly>
            </nav>
        </div>
    </header>
</template>

<script lang="ts">
import { APP_NAME } from '@/common/Constants'
import { computed, defineComponent, ref } from 'vue'
import { useUserStore } from '@/web/store/User'
import { login, logout } from '@/web/utils/api'

export default defineComponent({
    setup() {
        const isHeaderItemsExpanded = ref(false)
        const closeHeaderItems = () => {
            isHeaderItemsExpanded.value = false
        }

        const userStore = useUserStore()
        const currentUser = computed(() => userStore.state.currentUser)

        return {
            APP_NAME,
            isHeaderItemsExpanded,
            closeHeaderItems,
            currentUser,

            login,
            logout,
        }
    },
})
</script>

<style lang="scss">
header.layout-header {
    color: white;
    line-height: $header-line-height;

    background: $dark;
    padding: $padding 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 9;

    .container{
        display: flex;
        align-items: center;
        padding-left: $padding;
        padding-right: $padding;

        @media (max-width: $mobile-breakpoint) {
            flex-wrap: wrap;
            padding-left: $padding * 2;
            padding-right: $padding * 2;
        }
    }

    a{
        color: white;
        display: flex;
        font-weight: bold;
        text-decoration: none;

        &:not(.q-btn) {
            padding: $padding;
        }

        &:hover{
            color: $secondary;
            text-decoration: none;
        }
    }

    .header-logo{
        font-weight: bold;

        @media (max-width: $mobile-breakpoint) {
            width: 100%;
            display: grid;
            grid-template-columns: $header-btn-size 1fr $header-btn-size;
        }

        a.logo{
            align-items: center;
            display: flex;
            font-size: 1.618rem;
            justify-content: center;
        }

        .expand-btn{
            border: 1px solid $light-on-dark;
            display: none;
            width: $header-btn-size;
            height: $header-btn-size;

            @media (max-width: $mobile-breakpoint) {
                display: inherit;
            }
        }
    }

    nav.header-items{
        align-items: center;
        display: flex;
        flex: 1;

        @media (max-width: $mobile-breakpoint) {
            display: block;
            flex: none;
            overflow: hidden;
            width: 100%;
            height: 0;

            visibility: hidden;
            opacity: 0;
            transition: visibility 0s, opacity 0.25s linear;

            &.expanded{
                height: auto;
                margin-top: $padding * 2;

                visibility: visible;
                opacity: 1;
            }

            > *:last-child{
                margin-bottom: $padding;
            }

            .seperator{
                height: $padding * 2;
            }

            a:not(.q-btn){
                border-bottom: 1px solid $light-on-dark;
                padding-left: 0;
                padding-right: 0;
                width: 100%;

                &:first-of-type{
                    border-top: 1px solid $light-on-dark;
                }
            }

            .q-btn{
                display: block;
                padding: math.div($padding, 2) $padding;
                width: 100%;
            }
        }
    }
}
</style>
