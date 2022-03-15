<script>
  import { browser } from "$app/env";
  import { onDestroy, onMount } from "svelte";
  import Card from "./Card.svelte";

  export let open;
  export let maxWidth = '';

  function escape(e) {
    if (e.key === 'Escape') {
      open = false;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', escape, false);
  });

  onDestroy(() => {
    browser && window.removeEventListener('keydown', escape, false);
  });
</script>


<div class="shadow {open ? 'open' : ''}" on:click={e => { if (!e.target.
  // @ts-ignore
  closest('.modal')) open = false; }}>
  <div class="modal" style="max-width: {maxWidth};">
    <Card>
      <slot />
    </Card>
  </div>
</div>

<style>
  .shadow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    display: none;
    padding: 2em;
    justify-content: center;
    align-items: start;
  }

  .open {
    display: flex;
  }
</style>
