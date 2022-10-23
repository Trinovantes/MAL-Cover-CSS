<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import type { ObjectFitProperty, ObjectPositionProperty } from 'csstype'

const props = defineProps({
    src: {
        type: String as PropType<string | undefined>,
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
    objectFit: {
        type: String as PropType<ObjectFitProperty>,
        default: 'contain',
    },
    objectPosition: {
        type: String as PropType<ObjectPositionProperty<`${number}px`>>,
        default: 'center',
    },
    aspectRatio: {
        type: Number,
        default: 1.618,
    },
    keepAspectRatio: {
        type: Boolean,
        default: true,
    },
})

// Set up intersection observer
const containerRef = ref<HTMLDivElement | null>(null)
const hasScrolledIntoView = ref(false)
let observer: IntersectionObserver | null = null
onMounted(() => {
    if (!containerRef.value) {
        throw new Error('Cannot find containerRef')
    }
    if (!(containerRef.value instanceof Element)) {
        throw new Error(`containerRef is not an Element: ${typeof containerRef.value}`)
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

const realImgWidth = ref(0)
const realImgHeight = ref(0)
const onImageLoad = (loadEvent: Event) => {
    const img = loadEvent.target
    if (!(img instanceof HTMLImageElement)) {
        throw new Error(`loadEvent.target is not an HTMLImageElement: ${typeof img}`)
    }

    realImgWidth.value = img.naturalWidth
    realImgHeight.value = img.naturalHeight
}

const paddingTop = computed<string>(() => {
    if (props.height !== undefined) {
        return `${props.height}px`
    }

    if (props.keepAspectRatio) {
        const aspectRatio = realImgWidth.value > 0
            ? (realImgHeight.value / realImgWidth.value)
            : props.aspectRatio

        return props.width === undefined
            ? `${aspectRatio * 100}%`
            : `${aspectRatio * props.width}px`
    }

    return `${props.aspectRatio * 100}%`
})
</script>

<template>
    <figure
        ref="containerRef"
    >
        <picture
            :style="{ paddingTop }"
        >
            <img
                v-if="hasScrolledIntoView && src"
                :src="src"
                :width="width || undefined"
                :height="height || undefined"
                :title="title"
                :alt="alt ?? title"
                :style="{
                    objectFit,
                    objectPosition,
                }"
                loading="lazy"
                referrerpolicy="no-referrer"
                @load="onImageLoad"
            >
            <LoadingSpinner
                v-else
                class="loading-spinner"
            />
        </picture>

        <figcaption v-if="$slots.default">
            <slot />
        </figcaption>
    </figure>
</template>

<style lang="scss" scoped>
figure{
    picture{
        display: block;
        position: relative;
        width: 100%;

        img{
            display: block;
        }

        img,
        .loading-spinner{
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
        }
    }

    figcaption{
        font-size: 90%;
        font-style: italic;
        margin-top: $padding;
        text-align: center;
    }
}
</style>
