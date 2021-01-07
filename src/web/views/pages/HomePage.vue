<template>
    <header class="hero-unit center-vertically">
        <div class="row">
            <div class="img-col col-12 col-md">
                <img
                    src="@img/example-covers.png"
                    class="preview shadow-20"
                >
            </div>

            <div class="desc-col col-12 col-md">
                <div>
                    <h2>
                        {{ appDesc }}
                    </h2>
                    <CodeBlock
                        class="shadow-5"
                        lang="css"
                        code="heroUnitExample.css"
                        :show-line-numbers="false"
                    />
                    <div class="btn-group">
                        <q-btn
                            v-if="!currentUser"
                            color="positive"
                            no-caps
                            unelevated
                            label="Log in with MAL"
                            @click="onClickLogin"
                        />
                        <q-btn
                            outline
                            no-caps
                            unelevated
                            color="white"
                            label="Guide"
                            to="guide"
                        />
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import { VuexAccessor } from '@views/mixins/VuexAccessor'
import { ApiAccessor } from '@views/mixins/ApiAccessor'
import { Page } from '@views/mixins/Page'
import Constants from '@common/Constants'

@Component({
    components: {
        CodeBlock: () => import('@views/components/CodeBlock.vue'),
    },
})
export default class HomePage extends mixins(Page, VuexAccessor, ApiAccessor) {
    appDesc = Constants.APP_DESC
}
</script>

<style lang="scss">
.hero-unit{
    background: linear-gradient(lighten($primary, 5%), lighten($primary, 10%) 33%, $primary);
    color: white;
    overflow: hidden;

    .row{
        flex-direction: row-reverse;

        .desc-col,
        .img-col{
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
        }

        .img-col{
            @media (min-width: $mobile-breakpoint) {
                margin-left: $padding * 2;
                max-width: max-content;
            }
        }
    }

    h2{
        text-align: center;

        @media (min-width: $mobile-breakpoint) {
            text-align: left;
        }
    }

    img.preview{
        border: $padding solid white;
        display: block;
        margin: 0 auto;

        object-fit: cover;
        max-height: 300px;
        width: 100%;

        @media (min-width: $mobile-breakpoint) {
            max-height: 100%;
        }
    }
}
</style>
