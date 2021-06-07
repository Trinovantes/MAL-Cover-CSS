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

<style lang="scss">
footer.layout-footer{
    font-size: 1rem;

    a{
        color: white;
        text-decoration: none;

        &:hover{
            color: #999;
        }
    }

    &.copyright{
        background: $dark;
        color: #999;
        padding: ($padding * 3) 0;

        p{
            margin: math.div($padding, 2) 0;
        }
    }
}
</style>
