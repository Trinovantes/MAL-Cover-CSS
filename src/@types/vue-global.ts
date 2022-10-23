import type ClientOnly from '@/web/client/components/ClientOnly.vue'
import type CodeBlock from '@/web/client/components/CodeBlock.vue'
import type ExternalLink from '@/web/client/components/ExternalLink.vue'
import type LazyImage from '@/web/client/components/LazyImage.vue'

declare module '@vue/runtime-core' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface GlobalComponents {
        ClientOnly: typeof ClientOnly
        CodeBlock: typeof CodeBlock
        ExternalLink: typeof ExternalLink
        LazyImage: typeof LazyImage
    }
}
