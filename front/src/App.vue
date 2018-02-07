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
    }

    #app {
        display: grid;
        grid-template-rows: 3% 95%;
    }

    #header {
        border-bottom: 1px solid black;
    }

    #header h1 {
        margin-left: 79px;
        margin-top: 30px;
    }

    .main-page {
        background-color: #586670;
        min-height: 500px;
    }
</style>
