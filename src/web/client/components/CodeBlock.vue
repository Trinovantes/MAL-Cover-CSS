<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { escapeHtml } from '../utils/escapeHtml.ts'
import { sleep } from '../../../common/utils/sleep.ts'

const props = defineProps({
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: 'css',
    },
})

const highlightedCode = ref<string>(escapeHtml(props.code))
watch(() => props, async () => {
    const { codeToHtml } = await import('shiki')
    highlightedCode.value = await codeToHtml(props.code, {
        lang: props.language,
        theme: 'monokai',
    })
}, {
    immediate: true,
})

const hasClipboard = ref(false)
onMounted(() => {
    hasClipboard.value = 'clipboard' in navigator
})

const showCheckmark = ref(false)
async function copyToClipboard() {
    await navigator.clipboard.writeText(props.code)

    // Update icon temporarily
    showCheckmark.value = true
    await sleep(3000)
    showCheckmark.value = false
}
</script>

<template>
    <div class="code-block">
        <q-btn
            v-if="hasClipboard"
            :icon="showCheckmark ? 'check' : 'content_copy'"
            outline
            round
            color="white"
            title="Copy code to clipboard"
            @click="copyToClipboard"
        />

        <div v-html="highlightedCode" />
    </div>
</template>

<style lang="scss" scoped>
.code-block{
    position: relative;

    button{
        $size: $padding * 3;

        border: 1px solid #aaa;
        border-radius: math.div($padding, 2);
        background: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        width: $size; height: $size;

        position: absolute;
        top: $padding; right: $padding;

        cursor: pointer;
        opacity: 0;
        transition: 1s;

        &:hover{
            background: #ccc;
        }

        svg{
            width: math.div($size, 2);
            height: math.div($size, 2);
        }
    }

    &:hover{
        button{
            opacity: 1;
        }
    }
}
</style>
