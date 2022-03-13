<script>
  export let name = '';
</script>

{#if name}
  <h1>Hi, {name}</h1>
{:else}
  <h1>Hello!</h1>
{/if}
