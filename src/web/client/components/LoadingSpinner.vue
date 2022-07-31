<template>
    <div class="spinner-wrapper">
        <div class="spinner" />
    </div>
</template>

<style lang="scss" scoped>
.spinner{
    border-radius: 50%;
    border: 1em solid $light-on-light;
    border-left: 1em solid $dark;
    width: 120px; height: 120px;

    transform: translateZ(0);
    animation: spinner 1s linear infinite;
}

@keyframes spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
