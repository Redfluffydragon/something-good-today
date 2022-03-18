<script>
  import { browser } from '$app/env';
  import { onDestroy, onMount } from 'svelte';
  import Card from './Card.svelte';
  import { safeScale } from './transitions';

  export let button;
  export let open = false;

  /** @type {'right'|'bottom'} */
  export let position = browser && window.innerWidth > 600 ? 'right' : 'bottom';

  let popup;
  $: calcLeft = position === 'right' ? `${button?.offsetWidth + 15}px` : '';

  onMount(() => {
    document.addEventListener('click', closeOnClick, false);
    addEventListener('keydown', escape, false);

    addEventListener('resize', () => {
      position = browser && window.innerWidth > 600 ? 'right' : 'bottom';
    }, false);
  });

  onDestroy(() => {
    if (!browser) return;

    document.removeEventListener('click', closeOnClick, false);
    removeEventListener('keydown', escape, false);
  });

  function closeOnClick(e) {
    setTimeout(() => {
      if (!e.target.closest('.popup') && e.target !== button) {
        open = false;
      }
    }, 100);
  }

  function escape(e) {
    if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

{#if open}
  <div
    bind:this={popup}
    transition:safeScale={{ duration: 300 }}
    class='popup {position}'
    style='left: {calcLeft}; max-width: calc(100vw - {popup?.offsetLeft}px - 2ch);'
  >
    <Card style="border: 2px solid var(--color);">
      <slot />
    </Card>
  </div>
{/if}

<style>
  .popup {
    position: absolute;
    width: max-content;
  }

  .right {
    transform: translateY(-50%);
  }

  .bottom {
    top: calc(100% + 1.5ch);
  }
</style>
