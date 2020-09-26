<template>
  <div>
    <navbar />
    <div class="container-fluid">
      <Nuxt />
    </div>
  </div>
</template>

<script>
import navbar from '@/components/navbar'
export default {
  components: {
    navbar,
  },
}
</script>

<style lang="scss">
@import '~assets/scss/main.scss';

.btn {
  min-width: 5em;
}

h1 {
  font-family: Cabin, sans-serif;
}

h2 {
  font-size: 1.75rem;
}

#subtitle {
  font-size: 1.5rem;
}
</style>
