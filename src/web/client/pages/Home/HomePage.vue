<script lang="ts" setup>
import { computed } from 'vue'
import { useApi } from '../../services/useApi'
import { useUserStore } from '../../store/User/useUserStore'
import { useLiveMeta } from '../../utils/useLiveMeta'
import { APP_NAME, APP_DESC } from '@/common/Constants'
import type { ResponsiveLoaderAsset } from '../../utils/ResponsiveLoader'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const img = require('../../assets/img/example-covers.jpg?size=800') as ResponsiveLoaderAsset

useLiveMeta({
    title: APP_NAME,
    desc: APP_DESC,
    image: img.src,
})

const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)

const { login } = useApi()

const onIntersect = (entry: IntersectionObserverEntry) => {
    if (!entry.isIntersecting) {
        return
    }

    entry.target.classList.add('visible')
}
</script>

<template>
    <article class="hero-unit">
        <div class="container full-height-container vertical">
            <section>
                <LazyImage
                    :src="require('../../assets/img/example-covers.jpg').src"
                    :height="435"
                    object-fit="cover"
                    object-position="top"
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
        v-intersection.once="{
            handler: onIntersect,
            cfg: {
                threshold: [0.25],
            },
        }"
        class="hero-unit"
    >
        <div class="container full-height-container">
            <section>
                <LazyImage
                    :src="require('../../assets/img/example-covers.jpg').src"
                    :height="600"
                    object-fit="cover"
                />
            </section>
            <section class="flex-vgap">
                <h1>
                    Not a developer?
                </h1>

                <h2>
                    If you're just looking for a Classic list design, try out this example. You can see it in action on my <ExternalLink href="https://myanimelist.net/animelist/Trinovantes">profile page</ExternalLink>
                </h2>

                <CodeBlock
                    :code="require('./raw/how-to-use-example-covers.css')"
                />

                <div class="flex-hgap">
                    <q-btn
                        outline
                        unelevated
                        no-caps
                        label="How to Set Up Example"
                        to="/example"
                    />
                </div>
            </section>
        </div>
    </article>

    <article
        v-intersection.once="{
            handler: onIntersect,
            cfg: {
                threshold: [0.25],
            },
        }"
        class="hero-unit"
    >
        <div class="container full-height-container">
            <section>
                <LazyImage
                    :src="require('./img/modern-image-settings.png').src"
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
        font-weight: bold;
        font-size: 3rem;
        line-height: 1.2;
    }

    h2{
        font-weight: normal;
    }

    .q-btn{
        font-weight: bold;
        padding: $padding ($padding * 2.5);
    }

    figure :deep(img){
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

    &:first-child{
        background: $primary;
        color: white;

        h2{
            color: $light-on-primary;
        }

        figure :deep(img){
            border: none;
        }
    }

    @media (max-width: $large-mobile-breakpoint) {
        &:not(:last-of-type){
            border-bottom: 1px solid $light-on-light;
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

                animation-name: fadeInLeft;
            }
        }
    }

    .container{
        padding-top: $vspace;
        padding-bottom: $vspace;

        display: grid;
        grid-template-columns: calc(50% - #{math.div($column-gap, 2)}) calc(50% - #{math.div($column-gap, 2)});
        align-items: center;
        gap: $column-gap;

        @mixin vertical-container{
            grid-template-columns: 100%;
            text-align: center;

            .flex-hgap{
                justify-content: center;
            }
        }

        &.vertical{
            @include vertical-container;
        }

        @media (max-width: $large-mobile-breakpoint) {
            @include vertical-container;
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
