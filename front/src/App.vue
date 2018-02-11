<template>
    <div id="app">
        <vue-header></vue-header>
        <main-page></main-page>
    </div>
</template>

<script>
  import VueHeader from './components/Header';
  import MainPage from './components/MainPage';

  export default {
    name: 'App',
    components: {
      MainPage,
      VueHeader
    },
  };
</script>

<style>
    body {
        margin: 0;
        font-family: 'Open Sans', sans-serif;
        overflow-x: hidden;
    }

    #app {
        display: grid;
        grid-template-rows: 5% 95%;
        height: 830px;
    }

    #header {
        margin-top: 10px;
    }

    .main-page {
        background-color: #586670;
        margin-top: 10px;
    }
</style>
