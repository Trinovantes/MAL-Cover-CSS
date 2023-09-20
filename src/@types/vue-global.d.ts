import ClientOnly from '@/web/client/components/ClientOnly.vue'
import CodeBlock from '@/web/client/components/CodeBlock.vue'
import ExternalLink from '@/web/client/components/ExternalLink.vue'

declare module '@vue/runtime-core' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface GlobalComponents {
        ClientOnly: typeof ClientOnly
        CodeBlock: typeof CodeBlock
        ExternalLink: typeof ExternalLink
    }
}
