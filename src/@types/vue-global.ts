import type ClientOnly from '@/web/client/components/Global/ClientOnly.vue'
import type CodeBlock from '@/web/client/components/Global/CodeBlock.vue'
import type ExternalLink from '@/web/client/components/Global/ExternalLink.vue'
import type LoadingSpinner from '@/web/client/components/Global/LoadingSpinner.vue'
import type SimpleImage from '@/web/client/components/Global/SimpleImage.vue'

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        ClientOnly: typeof ClientOnly
        CodeBlock: typeof CodeBlock
        ExternalLink: typeof ExternalLink
        LoadingSpinner: typeof LoadingSpinner
        SimpleImage: typeof SimpleImage
    }
}
