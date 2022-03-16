<script>
  export let color;
</script>

<span style="text-decoration-color: {color};"><slot /></span>

<style>
  span {
    text-decoration: underline;
  }
</style>