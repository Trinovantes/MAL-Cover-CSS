<template>
    <MainLayoutHeader />
    <main class="page full-height-container">
        <router-view />
    </main>
    <MainLayoutFooter />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MainLayoutHeader from './MainLayoutHeader.vue'
import MainLayoutFooter from './MainLayoutFooter.vue'

export default defineComponent({
    components: {
        MainLayoutHeader,
        MainLayoutFooter,
    },
})
</script>

<style lang="scss">
main.page{
    margin-top: $header-height;
}

noscript{
    display: block;
    position: fixed;
    top: $header-height;
    width: 100%;
    z-index: 9;
}

.container{
    margin-left: auto;
    margin-right: auto;
    max-width: $max-page-width;
    padding-left: $padding * 2;
    padding-right: $padding * 2;
    width: 80%;

    @media (max-width: $large-mobile-breakpoint) {
        width: 100%;
    }
}

.full-height-container{
    min-height: calc(100vh - #{$header-height});
}

.text-container{
    padding-top: $vspace;
    padding-bottom: $vspace;

    display: grid;
    gap: $column-gap;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);

    &.full{
        grid-template-columns: minmax(0, 1fr);
    }

    &.left-sidebar{
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    }

    @media (max-width: $large-mobile-breakpoint) {
        grid-template-columns: minmax(0, 1fr);
    }

    > h1{
        grid-column: 1 / -1;
        margin: 0;
    }

    h2, h3, h4, h5, h6,
    p,
    pre,
    ul, ol, dl,
    .simple-image,
    .q-form,
    .q-field,
    .grid,
    .callout{
        margin: ($padding * 2) 0;

        &:first-child{
            margin-top: 0;
        }

        &:last-child{
            margin-bottom: 0;
        }
    }

    h2, h3, h4, h5, h6{
        margin-top: ($padding * 4);

        & + h2,
        & + h3,
        & + h4,
        & + h5,
        & + h6{
            margin-top: $padding * 2;
        }
    }

    ul, ol, dl{
        padding-left: $padding * 2;

        ul, ol, dl{
            margin: $padding 0 !important;
        }
    }
    ul{
        list-style-type: disc;
    }
    ol{
        list-style-type: decimal;
    }
    dl{
        dt{
            font-weight: bold;
        }
        dd{
            margin-left: $padding * 2;
        }
    }

    em{
        font-style: italic;
    }

    strong{
        font-weight: bold;
    }

    code{
        background: $light-on-light;
        border-radius: math.div($padding, 4);
        font-family: 'Courier New', Courier, monospace;
        padding: math.div($padding, 4) math.div($padding, 2);
    }

    table{
        thead{
            font-weight: bold;

            tr{
                border-top: 1px solid;
            }
        }

        tr{
            border-bottom: 1px solid;
        }

        td{
            padding: math.div($padding, 2) $padding;
        }
    }

    .grid{
        display: grid;
        gap: $padding * 2;

        > *{
            margin: 0 !important;
        }

        .simple-image{
            justify-content: start;
        }
    }

    @for $i from 2 through 6{
        .grid-#{$i}{
            grid-template-columns: repeat(#{$i}, 1fr);
        }
    }

    picture{
        border: math.div($padding, 2) solid $light-on-light;
        border-radius: math.div($padding, 4);
    }
}
</style>
