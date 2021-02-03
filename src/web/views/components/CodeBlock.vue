<template>
    <pre
        ref="pre-block"
        :data-line="highlights"
        :class="{
            ['line-numbers']: showLineNumbers,
        }"
    >
        <code
            ref="code-block"
            :class="`language-${lang}`"
        />
    </pre>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Mixins } from 'vue-property-decorator'

import Prism from 'prismjs'
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace'
import 'prismjs/plugins/line-highlight/prism-line-highlight'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

import 'prismjs/themes/prism-okaidia.css'
import 'prismjs/plugins/line-highlight/prism-line-highlight.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

@Component
export default class CodeBlock extends Mixins(Vue) {
    @Prop({ type: String, required: true }) readonly lang!: string
    @Prop({ type: String, required: true }) readonly code!: string
    @Prop({ type: Boolean, default: true }) readonly isFile!: boolean
    @Prop({ type: String, required: false }) readonly highlights!: string
    @Prop({ type: Boolean, default: true }) readonly showLineNumbers!: boolean

    @Ref('pre-block') readonly preBlock!: HTMLElement
    @Ref('code-block') readonly codeBlock!: HTMLElement

    private readonly rawFiles = getRawFiles()

    mounted(): void {
        let contents: string
        if (this.isFile) {
            contents = this.rawFiles[this.code].trim()
        } else {
            contents = this.code.trim()
        }

        this.codeBlock.textContent = contents
        Prism.highlightElement(this.codeBlock)
    }
}

function getRawFiles(): { [key: string]: string } {
    const req = require.context('!!raw-loader?esModule=false!@raw', false, /\.*$/)
    const files: { [key: string]: string } = {}

    req.keys().map((fileName) => {
        files[fileName.replace('./', '')] = req(fileName) as string
    })

    return files
}
</script>
