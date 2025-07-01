<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useApi } from '../utils/useApi.ts'
import { useUserStore } from '../store/User/useUserStore.ts'
import { APP_NAME } from '../../../common/Constants.ts'

const isHeaderItemsExpanded = ref(false)
const closeHeaderItems = () => {
    isHeaderItemsExpanded.value = false
}

const userStore = useUserStore()
const currentUser = computed(() => userStore.user)

const { login, logout } = useApi()
</script>

<template>
    <nav>
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

            <div
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

                <div class="flex-1" />

                <template v-if="currentUser">
                    <router-link to="/settings" @click="closeHeaderItems">
                        Settings
                    </router-link>

                    <q-btn
                        class="dashboard-btn"
                        color="negative"
                        unelevated
                        rounded
                        no-caps
                        no-wrap
                        label="Log Out"
                        title="Log Out"
                        @click="logout(); closeHeaderItems()"
                    />
                </template>
                <template v-else>
                    <q-btn
                        class="dashboard-btn"
                        color="positive"
                        unelevated
                        rounded
                        no-caps
                        no-wrap
                        label="Log In"
                        title="Log in with MyAnimeList"
                        @click="login(); closeHeaderItems()"
                    />
                </template>
            </div>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
nav{
    background: $dark;
    padding: $padding 0;
    line-height: $header-line-height;

    .container{
        display: flex;
        align-items: center;

        @media (max-width: $mobile-breakpoint) {
            flex-wrap: wrap;
            padding-left: $padding * 2;
            padding-right: $padding * 2;
        }
    }

    .header-items,
    .header-logo{
        a,
        button{
            background: none;
            border: 0;
            padding: $padding;
            cursor: pointer;

            color: white;
            font-weight: bold;
            text-align: left;
            transition: $transition;

            &:hover{
                color: $secondary;
            }
        }
    }

    .header-logo{
        @media (max-width: $mobile-breakpoint) {
            width: 100%;
            display: grid;
            grid-template-columns: $header-btn-size 1fr $header-btn-size;
        }

        a.logo{
            font-size: 1.5rem;
            font-weight: bold;
            margin-right: $padding;
            padding: 0;

            @media (max-width: $mobile-breakpoint) {
                margin-right: 0;

                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .expand-btn{
            border: 1px solid $light-on-dark;
            width: $header-btn-size;
            height: $header-btn-size;

            display: none;
            align-items: center;
            justify-content: center;

            @media (max-width: $mobile-breakpoint) {
                display: flex;
            }
        }
    }

    .header-items{
        font-weight: bold;

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

            a{
                border-bottom: 1px solid $light-on-dark;
                display: block;
                width: 100%;

                &:first-of-type{
                    border-top: 1px solid $light-on-dark;
                }
            }

            .dashboard-btn{
                display: block;
                margin-top: $padding * 2;
                margin-bottom: $padding;
                padding: math.div($padding, 2) $padding;
                width: 100%;
            }
        }
    }
}
</style>
