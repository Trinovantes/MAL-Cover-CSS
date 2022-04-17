import ClientOnly from '@/web/components/Global/ClientOnly.vue'
import ExternalLink from '@/web/components/Global/ExternalLink.vue'
import SimpleImage from '@/web/components/Global/SimpleImage.vue'
import CodeBlock from '@/web/components/Global/CodeBlock.vue'

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        ClientOnly: typeof ClientOnly
        ExternalLink: typeof ExternalLink
        SimpleImage: typeof SimpleImage
        CodeBlock: typeof CodeBlock
    }
}
