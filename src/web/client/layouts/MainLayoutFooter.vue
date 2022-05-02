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
                Souce code available on <ExternalLink href="https://github.com/Trinovantes/MAL-Cover-CSS" color="white">GitHub</ExternalLink>.
            </p>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
footer{
    font-size: 1rem;
    color: #999;

    background: $dark-page;
    padding: ($padding * 3) 0;
}
</style>
