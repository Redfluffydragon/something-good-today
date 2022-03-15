<script>
  import { reducedMotion } from "$lib/stores";
  import { onMount } from "svelte";

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    $reducedMotion = mediaQuery.matches;

    mediaQuery.addEventListener('change', () => {
      $reducedMotion = mediaQuery.matches;
    });
  });
</script>

<slot />
