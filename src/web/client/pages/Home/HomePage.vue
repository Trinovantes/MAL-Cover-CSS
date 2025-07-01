<script lang="ts" setup>
import { computed } from 'vue'
import type { IntersectionValue } from 'quasar'
import examplePreviewImg from '@img/example-covers-preview.jpg?rl'
import settingsImg from './img/modern-image-settings.png?rl'
import { useSeoMeta } from '@unhead/vue'
import { APP_NAME, APP_DESC } from '../../../../common/Constants.ts'
import { useUserStore } from '../../store/User/useUserStore.ts'
import { useApi } from '../../utils/useApi.ts'

useSeoMeta({
    title: APP_NAME,
    description: APP_DESC,
    ogImage: examplePreviewImg.src,
    twitterCard: 'summary_large_image',
})

const userStore = useUserStore()
const user = computed(() => userStore.user)
const { login } = useApi()

const intersectConfig: IntersectionValue = {
    cfg: {
        threshold: [0.25],
    },
    handler: (entry) => {
        if (!entry?.isIntersecting) {
            return true
        }

        entry.target?.classList.add('visible')
        return false
    },
}
</script>

<template>
    <article class="hero-unit">
        <div class="container full-height-container vertical">
            <section>
                <q-img
                    :src="examplePreviewImg.src"
                    fit="cover"
                />
            </section>
            <section class="flex-vgap">
                <h1>
                    {{ APP_DESC }}
                </h1>

                <CodeBlock
                    :code="require('./raw/example-usage.css')"
                />

                <div class="flex-hgap">
                    <q-btn
                        v-if="user"
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
                        @click="login"
                    />

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

    <article
        v-intersection.once="intersectConfig"
        class="hero-unit"
    >
        <div class="container full-height-container">
            <section>
                <q-img
                    :src="require('@img/example-covers.jpg?size=400').src"
                    height="600"
                    fit="cover"
                />
            </section>
            <section class="flex-vgap">
                <h1>
                    Not a developer?
                </h1>

                <h2>
                    If you're just looking for a Classic list design, try out this example list design
                </h2>

                <CodeBlock
                    :code="require('./raw/how-to-use-example-covers.css')"
                />

                <div class="flex-hgap">
                    <q-btn
                        outline
                        unelevated
                        no-caps
                        label="How to Set Up Example List Design"
                        to="/example"
                    />
                </div>
            </section>
        </div>
    </article>

    <article
        v-intersection.once="intersectConfig"
        class="hero-unit"
    >
        <div class="container full-height-container">
            <section>
                <q-img
                    :src="settingsImg.src"
                />
            </section>
            <section class="flex-vgap">
                <h1>
                    This service is only for Classic list designs
                </h1>

                <h2>
                    Modern list designs already have an option to directly embed cover images into your lists
                </h2>

                <div class="flex-hgap">
                    <q-btn
                        outline
                        unelevated
                        no-caps
                        label="Learn More about Modern Templates"
                        to="/classic-vs-modern"
                    />
                </div>
            </section>
        </div>
    </article>
</template>

<style lang="scss" scoped>
article.hero-unit{
    h1, h2 {
        margin: 0;
    }

    h1{
        font-weight: 700;
        font-size: 3rem;
        line-height: 1.25;
    }

    h2{
        font-weight: 300;
    }

    .q-btn{
        font-weight: bold;
        padding: $padding ($padding * 2.5);
    }

    .q-img {
        :deep(img){
            border: math.div($padding, 2) solid $light-on-light;
            border-radius: math.div($padding, 4);
            overflow: hidden;

            box-shadow:
                0 0.4px 1.3px rgba(0, 0, 0, 0.045),
                0 1.1px 3.2px rgba(0, 0, 0, 0.065),
                0 2px 6px rgba(0, 0, 0, 0.08),
                0 3.6px 10.7px rgba(0, 0, 0, 0.095),
                0 6.7px 20.1px rgba(0, 0, 0, 0.115),
                0 16px 48px rgba(0, 0, 0, 0.16)
            ;
        }

        @media (max-width: $mobile-breakpoint) {
            max-height: 400px;
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
        &:not(:last-of-type){
            border-bottom: 1px solid $light-on-light;
        }
    }

    .container{
        padding-top: $vspace;
        padding-bottom: $vspace;

        display: grid;
        grid-template-columns: calc(50% - #{$hspace}) calc(50% - #{$hspace});
        align-items: center;
        align-content: center;
        gap: $hspace * 2;

        @mixin vertical-container{
            grid-template-columns: 100%;
            text-align: center;

            .flex-hgap{
                justify-content: center;
                gap: $padding * 2;
            }
        }

        &.vertical{
            @include vertical-container;
        }

        @media (max-width: $mobile-breakpoint) {
            @include vertical-container;
        }
    }

    &:not(:first-child){
        .container{
            animation-duration: 1s;
            animation-fill-mode: both;
            transform: translate3d(-100%, 0, 0);
        }
        &.visible{
            .container{
                animation-name: fadeInLeft;

                @keyframes fadeInLeft {
                    0% {
                        opacity: 0;
                        transform: translate3d(-100%, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        transform: translateZ(0);
                    }
                }
            }
        }
    }

    &:nth-child(2) .container{
        direction: rtl;

        > section{
            direction: ltr;
        }
    }
}
</style>
