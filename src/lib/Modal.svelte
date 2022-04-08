<script>
  import { browser } from '$app/env';
  import { onDestroy, onMount } from 'svelte';
  import Card from './Card.svelte';
  import { safeScale } from './transitions';
  import { fade } from 'svelte/transition';
  import { beforeNavigate } from '$app/navigation';

  /** @type {bool} */
  export let open;

  /** @type {string} */
  export let title = '';

  /** @type {string} */
  export let maxWidth = '';

  export let minWidth = '';

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

  beforeNavigate(() => {
    open = false;
  });
</script>

{#if open}
  <div class="shadow" transition:fade={{ duration: 300 }}>
    <div class="modal" transition:safeScale={{ duration: 300 }} style="max-width: {maxWidth}; min-width: min(100%, {minWidth});">
      <Card>
        <div class="wrapper" role="dialog" aria-labelledby="modal-title-{title}" aria-modal="true">
          <div class="header">
            {#if title}
              <h2 id="modal-title-{title}">{title}</h2>
            {/if}
            <button
              class="img-btn clear-btn"
              title="Close {title} modal"
              on:click={() => {
                open = false;
              }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64">
                <path d="M56 8L8 56M8 8L56 56" stroke="var(--color)" stroke-width="5" />
              </svg>
            </button>
          </div>

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
    background: var(--shadow);
    display: flex;
    padding: 2em;
    justify-content: center;
    align-items: start;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 1000;
  }

  .header {
    display: grid;
    grid-template-columns: 1fr 1.5em;
    align-items: center;
    margin-bottom: 2ch;
    gap: 3ch;
  }

  h2 {
    line-height: 1;
  }

  .img-btn {
    height: 1em;
    width: 1em;
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
