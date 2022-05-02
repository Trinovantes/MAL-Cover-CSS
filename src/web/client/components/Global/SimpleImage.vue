<script lang="ts" setup>
import { onMounted, PropType, ref, StyleValue, watch } from 'vue'
import type { ResponsiveImage } from '../../utils/ResponsiveImage'

defineProps({
    img: {
        type: Object as PropType<ResponsiveImage>,
        required: true,
    },
    imgStyle: {
        type: Object as PropType<StyleValue | undefined>,
        default: undefined,
    },
    title: {
        type: String as PropType<string | undefined>,
        default: undefined,
    },
    alt: {
        type: String as PropType<string | undefined>,
        default: undefined,
    },
    width: {
        type: Number as PropType<number | undefined>,
        default: undefined,
    },
    height: {
        type: Number as PropType<number | undefined>,
        default: undefined,
    },
    enableBackground: {
        type: Boolean,
        default: true,
    },
    sizes: {
        type: String,
        default: '100vw',
    },
})

// Set up image loading
const imageRef = ref<HTMLImageElement | null>(null)
const showLoading = ref(true)
onMounted(() => {
    watch(imageRef, () => {
        if (!imageRef.value) {
            return
        }

        // Don't set onload hook more than once
        if (imageRef.value.onload) {
            return
        }

        showLoading.value = !imageRef.value.complete

        imageRef.value.onload = () => {
            showLoading.value = false
        }
    }, {
        immediate: true,
    })
})
</script>

<template>
    <div
        ref="containerRef"
        class="simple-image"
    >
        <figure
            :class="{
                background: enableBackground,
            }"
        >
            <picture
                :style="{
                    backgroundSize: 'cover',
                    backgroundImage: (showLoading && img.placeholder) ? `url('${img.placeholder}')` : 'none'
                }"
            >
                <source
                    :srcset="img.srcSet"
                    :sizes="sizes"
                >
                <img
                    ref="imageRef"
                    :src="img.src"
                    :width="(width ?? img.width) || undefined"
                    :height="(height ?? img.height) || undefined"
                    :sizes="sizes"
                    :title="title"
                    :alt="alt ?? title"
                    :style="imgStyle"
                    loading="lazy"
                >
            </picture>

            <figcaption v-if="$slots.default">
                <slot />
            </figcaption>

            <LoadingSpinner
                v-if="showLoading"
            />
        </figure>
    </div>
</template>

<style lang="scss" scoped>
div.simple-image{
    display: flex;
    flex-direction: column;
    justify-content: start;

    figure{
        margin: 0;
        position: relative;

        &.background{
            img{
                border: math.div($padding, 2) solid $light-on-light;
            }
        }

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
            font-style: italic;
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
