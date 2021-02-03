<template>
    <footer class="footer">
        <div class="row">
            <div class="col">
                <p>&copy; malcovercss.link This is a third party tool and is not affiliated with MyAnimeList.net</p>
                <p>Souce code available on <a href="https://github.com/Trinovantes/MAL-Cover-CSS">GitHub</a></p>
            </div>
        </div>
    </footer>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'

@Component
export default class Footer extends Mixins(Vue) {
    // nop
}
</script>

<style lang="scss">
footer.footer{
    background: $dark;
    color: $dimmed-light;
    padding: ($padding * 2) 0;
    text-align: center;

    p{
        margin: $padding 0;
    }

    a{
        color: white;
    }
}
</style>
