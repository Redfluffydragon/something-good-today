<script>
  export let show;
</script>

{#if show}
  <button
    class="clear-btn"
    title="Click to dismiss"
    on:click={() => {
      show = false;
    }}
  >
    <p><slot /></p>
  </button>
{/if}

<style>
  button {
    padding: 0;
    width: 100%;
  }

  p {
    text-align: center;
    border-radius: 1ch;
    background: #a81b1b;
    color: white;
  }
</style>
