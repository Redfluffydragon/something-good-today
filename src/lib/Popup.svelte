<script>
  import { browser } from '$app/env';
  import { onDestroy, onMount } from 'svelte';
  import Card from './Card.svelte';
  import { safeScale } from './transitions';

  export let button;
  export let open = false;

  /** @type {'right'|'below'} */
  export let position = 'below right';

  onMount(() => {
    document.addEventListener('click', closeOnClick, false);
    addEventListener('keydown', escape, false);
  });

  onDestroy(() => {
    if (!browser) return;

    document.removeEventListener('click', closeOnClick, false);
    removeEventListener('keydown', escape, false);
  });

  function closeOnClick(e) {
    if (!e.target.closest('.popup') && !e.target.closest(button)) {
      open = false;
    }
  }

  function escape(e) {
    if (e.key === 'Escape') {
      open = false;
    }
  }
</script>

{#if open}
  <div transition:safeScale={{ duration: 300 }} class="popup {position}">
    <Card style="border: 2px solid var(--color);">
      <slot />
    </Card>
  </div>
{/if}

<style>
  .popup {
    position: absolute;
    width: max-content;
    z-index: 900;
  }

  .right {
    transform: translateY(-50%);
  }

  .below {
    top: calc(100% + 1.5ch);
  }

  .below.right {
    transform: none;
    right: 0;
  }
</style>
