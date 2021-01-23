<template>
    <article v-if="currentUser" class="settings-page">
        <div class="row">
            <div class="col-12 col-md-8">
                <h1>{{ pageTitle }}</h1>

                <div class="info">
                    <h3>MyAnimeList.net Username</h3>
                    <p class="info">
                        {{ currentUser.malUsername }}
                    </p>
                </div>

                <div class="info">
                    <h3>Last Checked</h3>
                    <div v-if="currentUser.lastChecked">
                        <p class="info last-checked">
                            {{ getRelativeTime(currentUser.lastChecked) }}
                        </p>
                        <p>
                            The generated CSS now includes anime and manga from your profile. Read the <router-link to="guide">guide</router-link> for more information on how to set up your profile theme.
                        </p>
                    </div>
                    <div v-else>
                        <p>
                            Your account has not been checked yet. The bot runs once every hour. Please check back again in about an hour.
                        </p>
                    </div>
                </div>

                <p class="unlink">
                    <q-btn
                        color="negative"
                        label="Unlink Account"
                        @click="onClickUnlinkAccount"
                    />
                    <small>
                        This will delete all of your account information from this website and your profile will no longer be checked.
                        You may continue to use the generated CSS but they may no longer style everything in your lists.
                    </small>
                </p>
            </div>
        </div>
    </article>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import { Page } from '@views/mixins/Page'
import { AuthenticatedPage } from '@views/mixins/AuthenticatedPage'
import { ApiAccessor } from '@views/mixins/ApiAccessor'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

@Component
export default class SettingsPage extends mixins(Page, AuthenticatedPage, ApiAccessor) {
    getPageTitle = 'Settings'

    getRelativeTime(date: Date): string {
        return dayjs(date).fromNow()
    }
}
</script>

<style lang="scss">
.settings-page{
    p{
        display: block;

        &.info{
            background: #eee;
            border-radius: 3px;
            padding: $padding ($padding * 2);
        }

        &.last-checked::first-letter{
            text-transform: capitalize;
        }

        &.unlink{
            .q-btn{
                display: block;
            }

            small{
                display: block;
                font-style: italic;
                margin-top: $padding * 2;
            }
        }
    }
}
</style>
