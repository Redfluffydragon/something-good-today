<script>
  import { browser } from '$app/env';
  import { onDestroy, onMount } from 'svelte';
  import Card from './Card.svelte';
  import { safeScale } from './transitions';

  export let button;
  export let open = false;

  export let position = 'right';

  function closeOnClick(e) {
    setTimeout(() => {
      if (!e.target.closest('.popup') && e.target !== button) {
        open = false;
      }
    }, 100);
  }

  /**
  * @param {{ key: string; }} e
  */
  function escape(e) {
    if (e.key === 'Escape') {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', closeOnClick, false);
    addEventListener('keydown', escape, false);
  });

  onDestroy(() => {
    if (!browser) return;

    document.removeEventListener('click', closeOnClick, false);
    removeEventListener('keydown', escape, false);
  });
</script>

{#if open}
  <div
    transition:safeScale={{ duration: 300 }}
    class='popup {position}'
    style='left: {button.offsetWidth + 15}px;'
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
    right: 0;
    transform: translateY(-50%);
  }
</style>
