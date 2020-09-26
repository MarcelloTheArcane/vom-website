<template>
  <div>
    <h1>Page Not Found</h1>
    <p>
      The specified file was not found on this website. Please check the URL for
      mistakes and try again.
    </p>
    <b-button to="/" variant="primary">Go to home page</b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Page Not Found',
    }
  },
  head() {
    return {
      title: `${this.title} | Value Our Minds`,
    }
  },
}
</script>
