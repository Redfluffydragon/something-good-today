<script>
  export let style = '';
</script>

<div {style}>
  <slot />
</div>

<style>
  div {
    background: var(--overlay-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-elevation-medium);
    padding: 2ch;
    max-width: 100%;
  }
</style>
