<template>
    <figure class="responsive-image">
        <picture
            :style="{
                backgroundSize: 'cover',
                backgroundImage: img.placeholder ? `url('${img.placeholder}')` : 'none'
            }"
        >
            <source
                :srcset="img.srcSet"
                :sizes="sizes"
            >
            <img
                :src="img.src"
                :width="img.width"
                :height="img.height"
                :sizes="sizes"
                loading="lazy"
            >
        </picture>

        <figcaption v-if="caption">
            {{ caption }}
        </figcaption>
    </figure>
</template>

<script lang="ts">
import { ResponsiveImage } from '@/web/utils/ResponsiveLoader'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props: {
        img: {
            type: Object as PropType<ResponsiveImage>,
            required: true,
        },
        sizes: {
            type: String,
            default: '100vw',
        },
        isContain: {
            type: Boolean,
            default: true,
        },
        caption: {
            type: String,
            default: '',
        },
    },
})
</script>

<style lang="scss">
figure.responsive-image{
    margin: 0;
    position: relative;

    img{
        display: block;
        height: auto;
        max-width: 100%;
        object-fit: cover;
    }

    figcaption{
        position: absolute;
        bottom: 0; left: 0;
        width: 100%;

        background: rgba($dark, 0.8);
        color: white;
        padding: $padding ($padding * 2);
        text-align: center;
    }
}
</style>
