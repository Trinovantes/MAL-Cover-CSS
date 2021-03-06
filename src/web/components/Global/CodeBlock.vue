<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <pre :class="className"><code v-html="highlightedCode" /></pre>
</template>

<script lang="ts">
import { ref, computed, defineComponent, watch } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai.css'

export default defineComponent({
    props: {
        code: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            default: '',
        },
        autodetect: {
            type: Boolean,
            default: true,
        },
        ignoreIllegals: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const language = ref(props.language)
        watch(() => props.language, (newLanguage) => {
            language.value = newLanguage
        })

        const autodetect = computed(() => props.autodetect || !language.value)
        const cannotDetectLanguage = computed(() => !autodetect.value && !hljs.getLanguage(language.value))

        const className = computed((): string => {
            let cssClass = ''

            if (!cannotDetectLanguage.value) {
                cssClass += 'hljs'
            }

            if (language.value) {
                cssClass += ' ' + language.value
            }

            return cssClass
        })

        const highlightedCode = ref<string>()
        const updateCode = () => {
            // No idea what language to use, return raw code
            if (cannotDetectLanguage.value) {
                console.warn(`The language "${language.value}" you specified could not be found.`)
                highlightedCode.value = escapeHtml(props.code)
                return
            }

            if (autodetect.value) {
                const result = hljs.highlightAuto(props.code)
                language.value = result.language ?? ''
                highlightedCode.value = result.value
            } else {
                const result = hljs.highlight(props.code, {
                    language: language.value,
                    ignoreIllegals: props.ignoreIllegals,
                })
                highlightedCode.value = result.value
            }
        }

        watch([cannotDetectLanguage, autodetect, props], updateCode, {
            deep: true,
        })

        updateCode()

        return {
            className,
            highlightedCode,
        }
    },
})

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
}
</script>
