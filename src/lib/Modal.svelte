<script>
  import { browser } from "$app/env";
  import { onDestroy, onMount } from "svelte";
  import Card from "./Card.svelte";
  import { safeScale } from './transitions';
  import { fade } from 'svelte/transition';

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

{#if open}
  <div class="shadow" transition:fade on:click={e => { if (!e.target.closest('.modal')) open = false; }}>
    <div class="modal" transition:safeScale style="max-width: {maxWidth};">
      <Card>
        <div class="wrapper">
          <slot />
        </div>
      </Card>
    </div>
  </div>
{/if}

<style>
  .shadow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    padding: 2em;
    justify-content: center;
    align-items: start;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .wrapper {
    max-height: 80vh;
    overflow: auto;
  }

  @media screen and (max-width: 400px) {
    .wrapper {
      max-height: 70vh;
    }
  }
</style>
