<script context="module">
  import { page } from '$app/stores';
</script>

<script>
  import { titleSuffix } from '$lib/stores';
</script>

<svelte:head>
  <title>{$page.status} {titleSuffix}</title>
</svelte:head>

<h1>{$page.status}</h1>

<h2>{$page.error.message}</h2>

<h3><a href="/">Back to homepage</a></h3>

<style>
  h1 {
    font-size: 10em;
    margin-top: 0;
    margin-bottom: 0.4em;
  }

  h2,
  h3 {
    text-align: center;
    font-weight: 100;
  }

  h2 {
    font-size: 3em;
  }

  h3 {
    font-size: 1.5em;
  }
</style>
