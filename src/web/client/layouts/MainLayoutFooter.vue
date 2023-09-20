<script lang="ts" setup>
import { APP_NAME } from '@/common/Constants'
const year = new Date().getFullYear()
</script>

<template>
    <footer>
        <div class="container">
            <p>
                &copy; {{ year }} {{ APP_NAME }}. This is a third party website and is not affiliated with MyAnimeList
            </p>
            <p>
                <ExternalLink href="https://github.com/Trinovantes/MAL-Cover-CSS" :dark="true">GitHub</ExternalLink>
            </p>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
footer{
    color: #999;
    background: $dark-page;
    padding: $hspace 0;

    p{
        margin: math.div($padding, 2) 0;
    }
}
</style>
