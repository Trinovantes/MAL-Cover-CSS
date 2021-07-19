<template>
    <div
        ref="containerRef"
        class="simple-image"
    >
        <figure
            v-if="hasScrolledIntoView"
        >
            <picture
                :style="{
                    backgroundSize: 'cover',
                    backgroundImage: (!isReady && img.placeholder) ? `url('${img.placeholder}')` : 'none'
                }"
            >
                <source
                    :srcset="img.srcSet"
                    :sizes="sizes"
                >
                <img
                    ref="imageRef"
                    :src="img.src"
                    :width="(width ?? img.width) || null"
                    :height="(height ?? img.height) || null"
                    :sizes="sizes"
                    :title="title"
                    :alt="alt ?? title"
                    loading="lazy"
                >
            </picture>

            <figcaption v-if="$slots.default">
                <slot />
            </figcaption>

            <div v-if="!isReady" class="spinner-wrapper">
                <div class="spinner" />
            </div>
        </figure>
    </div>
</template>

<script lang="ts">
import { ResponsiveImage } from '@/web/utils/ResponsiveLoader'
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'

export default defineComponent({
    props: {
        img: {
            type: Object as PropType<ResponsiveImage>,
            required: true,
        },
        title: {
            type: String as PropType<string | null>,
            default: null,
        },
        alt: {
            type: String as PropType<string | null>,
            default: null,
        },
        width: {
            type: Number,
            default: null,
        },
        height: {
            type: Number,
            default: null,
        },
        sizes: {
            type: String,
            default: '100vw',
        },
        renderOnServer: {
            type: Boolean,
            default: false,
        },
    },

    setup(props) {
        const containerRef = ref<HTMLDivElement | null>(null)
        const hasScrolledIntoView = ref(props.renderOnServer)
        let observer: IntersectionObserver | null = null

        // Set up intersection observer
        onMounted(() => {
            if (!containerRef.value) {
                throw new Error('Cannot find containerRef')
            }

            observer = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) {
                    return
                }

                hasScrolledIntoView.value = true
                observer?.disconnect()
            })
            observer.observe(containerRef.value)
        })
        onBeforeUnmount(() => {
            observer?.disconnect()
        })

        // Set up image loading
        const imageRef = ref<HTMLImageElement | null>(null)
        const isReady = ref(false)
        const checkIsReady = () => {
            if (!imageRef.value) {
                return
            }

            isReady.value = imageRef.value.complete
            imageRef.value.onload = () => {
                isReady.value = true
            }
        }
        onMounted(() => {
            watch(imageRef, checkIsReady)
            checkIsReady()
        })

        return {
            containerRef,
            imageRef,

            isReady,
            hasScrolledIntoView,
        }
    },
})
</script>

<style lang="scss">
div.simple-image{
    display: flex;
    flex-direction: column;
    justify-content: center;

    figure{
        margin: 0;
        position: relative;

        picture{
            display: block;

            img{
                display: block;
                margin: 0 auto;
                max-width: 100%; height: auto;
                object-fit: cover;
            }
        }

        figcaption{
            font-size: 90%;
            margin-top: $padding;
            text-align: center;
        }

        .spinner-wrapper{
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
