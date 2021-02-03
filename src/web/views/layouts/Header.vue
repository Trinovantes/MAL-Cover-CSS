<template>
    <header class="header">
        <q-toolbar>
            <div class="header-logo">
                <q-btn
                    icon="menu"
                    class="expand-btn"
                    flat
                    round
                    padding="0"
                    @click="expandHeaderItems = !expandHeaderItems"
                />
                <router-link to="/" class="logo">
                    {{ appName }}
                </router-link>
            </div>

            <div
                class="header-items"
                :class="{ expanded:expandHeaderItems }"
            >
                <nav>
                    <q-btn
                        rounded
                        flat
                        label="Guide"
                        to="guide"
                    />
                    <q-btn
                        v-if="currentUser"
                        rounded
                        flat
                        label="Settings"
                        to="settings"
                    />

                    <q-btn
                        v-if="currentUser"
                        color="negative"
                        rounded
                        label="Log Out"
                        @click="onClickLogout"
                    />
                    <q-btn
                        v-else
                        color="positive"
                        rounded
                        label="Log in"
                        @click="onClickLogin"
                    />
                </nav>
            </div>
        </q-toolbar>
    </header>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { ApiAccessor } from '@views/mixins/ApiAccessor'
import { VuexAccessor } from '@views/mixins/VuexAccessor'

import Constants from '@common/Constants'

@Component
export default class Header extends Mixins(ApiAccessor, VuexAccessor) {
    readonly appName = Constants.APP_NAME
    expandHeaderItems = false
}
</script>

<style lang="scss">
header.header {
    $expand-btn-size: 40px;

    background: $dark;
    color: white;
    padding: $padding 0;

    .q-toolbar{
        @media (max-width: $breakpoint-sm) {
            flex-wrap: wrap;
        }
    }

    a{
        color: white;
        display: block;
        text-decoration: none;
    }

    .header-logo{
        font-size: 21px;
        font-weight: bold;
        line-height: 1;
        padding: $padding 0;

        @media (max-width: $mobile-breakpoint) {
            display: flex;
            width: 100%;

            a.logo{
                flex: 1;
                padding-right: $expand-btn-size;
                text-align: center;

                display: flex;
                flex-direction: column;
                justify-content: center;
            }
        }

        .expand-btn{
            display: none;
            width: $expand-btn-size;
            height: $expand-btn-size;

            @media (max-width: $mobile-breakpoint) {
                display: block;
            }
        }
    }

    .header-items{
        display: flex;
        flex: 1;
        justify-content: flex-end;

        @media (max-width: $mobile-breakpoint) {
            display: none;
            width: 100%;

            &.expanded{
                display: block;
                flex: unset;
            }
        }

        nav{
            display: flex;

            @media (max-width: $mobile-breakpoint) {
                margin-top: $padding;
                display: block;

                a{
                    border-radius: 0;
                    border-top: 1px solid $dimmed;

                    &:last-of-type{
                        border-bottom: 1px solid $dimmed;
                    }
                }

                button{
                    margin-top: $padding;
                }
            }

            .q-btn{
                font-weight: bold;
                margin-left: $padding / 2;

                &:hover{
                    color: lighten($primary, 30%);
                }

                @media (max-width: $mobile-breakpoint) {
                    margin-left: 0;
                    padding: ($padding / 2) 0;
                    width: 100%;
                }

                .q-btn__wrapper{
                    padding-left: $padding;
                    padding-right: $padding;
                }
            }
        }
    }
}
</style>
