<script lang="ts">
import { APP_NAME } from '@/common/Constants'
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {
        return {
            APP_NAME,
            year: new Date().getFullYear(),
        }
    },
})
</script>

<template>
    <footer class="layout-footer copyright">
        <div class="container">
            <p>
                &copy; {{ year }} {{ APP_NAME }}. This is a third party website and is not affiliated with MyAnimeList
            </p>
            <p>
                Souce code available on <ExternalLink href="https://github.com/Trinovantes/MAL-Cover-CSS">GitHub</ExternalLink>.
            </p>
        </div>
    </footer>
</template>

<style lang="scss">
footer.layout-footer{
    font-size: 1rem;

    &.copyright{
        background: $dark-page;
        color: #999;
        padding: ($padding * 3) 0;

        a{
            color: white;
        }

        p{
            margin: math.div($padding, 2) 0;
        }
    }
}
</style>
