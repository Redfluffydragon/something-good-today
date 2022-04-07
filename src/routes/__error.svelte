<script context="module">
  /** @type {import('@sveltejs/kit').ErrorLoad} */
  export function load({ error, status }) {
    return {
      props: { error, status },
    };
  }
</script>

<script>
  import { titleSuffix } from '$lib/stores';

  /** @type {number} */
  export let status;

  /** @type {Error} */
  export let error;
</script>

<svelte:head>
  <title>{status} {titleSuffix}</title>
</svelte:head>

<h1>{status}</h1>

<h2>{error.message}</h2>

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
