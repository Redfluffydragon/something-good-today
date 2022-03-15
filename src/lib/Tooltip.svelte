<script>
import Card from "./Card.svelte";


</script>

<div class="tooltip">
  <Card>
    <slot />
  </Card>
</div>

<style>
  .tooltip {
    position: absolute;
    top: calc(100% + 1ch);
    width: max-content;
  }

  :global(.tooltip) {
    color: red;
  }
</style>
