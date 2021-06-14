<template>
    <article class="hero-unit">
        <div class="container vertical">
            <section>
                <q-img
                    :src="require('@/web/assets/img/home/example-covers.jpg').src"
                />
            </section>
            <section>
                <h1>
                    {{ APP_DESC }}
                </h1>

                <CodeBlock
                    lang="css"
                    :code="require('@/web/assets/raw/home/example-usage.css')"
                />

                <div class="btn-group">
                    <ClientOnly>
                        <q-btn
                            v-if="currentUser"
                            color="secondary"
                            unelevated
                            no-caps
                            label="Go to Settings"
                            to="/settings"
                        />
                        <q-btn
                            v-else
                            color="positive"
                            unelevated
                            no-caps
                            label="Log in with MAL to track your lists"
                            @click="login($route.path)"
                        />
                    </ClientOnly>

                    <q-btn
                        outline
                        unelevated
                        no-caps
                        color="white"
                        label="Guide"
                        to="guide"
                    />
                </div>
            </section>
        </div>
    </article>

    <article class="hero-unit">
        <div class="container">
            <section>
                <q-img
                    :src="require('@/web/assets/img/home/example-covers.jpg').src"
                />
            </section>
            <section>
                <h1>
                    Not a developer?
                </h1>

                <h2>
                    If you're just looking for a Classic list design, try out this example. You can see it in action on my <ExternalLink href="https://myanimelist.net/animelist/Trinovantes">profile page</ExternalLink>
                </h2>

                <CodeBlock
                    lang="css"
                    :code="require('@/web/assets/raw/home/how-to-use-example-covers.css')"
                />

                <div class="btn-group">
                    <q-btn
                        outline
                        unelevated
                        no-caps
                        label="Learn More"
                        to="/example"
                    />
                </div>
            </section>
        </div>
    </article>

    <article class="hero-unit">
        <div class="container">
            <section>
                <q-img
                    :src="require('@/web/assets/img/home/modern-image-settings.png').src"
                />
            </section>
            <section>
                <h1>
                    This service is only for Classic list designs
                </h1>

                <h2>
                    Modern list designs already have an option to directly embed cover images into your lists
                </h2>

                <div class="btn-group">
                    <q-btn
                        outline
                        unelevated
                        no-caps
                        label="Learn More"
                        to="/classic-vs-modern"
                    />
                </div>
            </section>
        </div>
    </article>
</template>

<script lang="ts">
import { APP_DESC, APP_NAME } from '@/common/Constants'
import { createPageHeadOptions } from '@/web/utils/PageHeadOptions'
import { computed, defineComponent } from 'vue'
import { useMeta } from 'vue-meta'
import { login } from '@/web/utils/api'
import { useUserStore } from '@/web/store/User'
import { getSocialImage } from '@/web/utils/ResponsiveLoader'

export default defineComponent({
    setup() {
        const img = getSocialImage('home/example-covers.jpg')

        useMeta(computed(() => {
            return createPageHeadOptions({
                title: APP_NAME,
                desc: APP_DESC,
                image: img.src,
            })
        }))

        const userStore = useUserStore()
        const currentUser = computed(() => userStore.state.currentUser)

        return {
            APP_DESC,
            currentUser,
            login,
        }
    },
})
</script>

<style lang="scss">
article.hero-unit{
    h1{
        margin: 0;
        font-size: 3rem;
        line-height: 1.2;
    }

    h2{
        font-weight: normal;
        margin: 0;
    }

    pre{
        margin: 0;
    }

    .q-img{
        border-radius: math.div($padding, 4);
        box-shadow:
            0 0.4px 1.3px rgba(0, 0, 0, 0.045),
            0 1.1px 3.2px rgba(0, 0, 0, 0.065),
            0 2px 6px rgba(0, 0, 0, 0.08),
            0 3.6px 10.7px rgba(0, 0, 0, 0.095),
            0 6.7px 20.1px rgba(0, 0, 0, 0.115),
            0 16px 48px rgba(0, 0, 0, 0.16)
        ;

        min-width: 300px;
        max-height: calc(100vh - #{$header-height} - #{$padding * 16});

        @media (max-width: $mobile-breakpoint) {
            max-height: 40vh;
        }
    }

    .btn-group{
        gap: $padding * 2;

        .q-btn{
            font-weight: bold;
            padding: $padding ($padding * 2.5);
        }
    }

    &:first-child{
        background: $primary;
        color: white;

        h2{
            color: $light-on-primary;
        }
    }

    @media (max-width: $mobile-breakpoint) {
        border-bottom: 1px solid $light-on-light;

        &:last-of-type{
            border-bottom: none;
        }
    }

    .container{
        min-height: calc(100vh - #{$header-height});
        padding-top: $vspace;
        padding-bottom: $vspace;

        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        gap: $column-gap;

        > *{
            flex: 1;
        }

        @mixin vertical-container{
            flex-wrap: nowrap;
            flex-direction: column;
            text-align: center;

            > *{
                flex: 0;
            }

            pre{
                width: -moz-fit-content;
                width: fit-content;
                max-width: 100%;

                margin-left: auto;
                margin-right: auto;
            }

            .btn-group{
                justify-content: center;
            }

            .q-img{
                max-height: 40vh;
            }
        }

        &.vertical{
            @include vertical-container;
        }

        @media (max-width: $mobile-breakpoint) {
            @include vertical-container;
            min-height: 0;
        }

        section{
            display: flex;
            flex-direction: column;
            gap: $padding * 2;
            justify-content: center;
        }
    }

    &:nth-child(2) .container{
        flex-direction: row-reverse;

        @media (max-width: $mobile-breakpoint) {
            // Intentionally not reversed so text/image alternate on mobile
            flex-direction: column;
        }
    }
}
</style>
