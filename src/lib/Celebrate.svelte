<script>
  import confetti from 'canvas-confetti';
  import { onMount } from 'svelte';

  export let play;

  let canvas;
  let newConfetti;

  onMount(() => {
    newConfetti = confetti.create(canvas, {
      resize: true,
    });
  });

  $: play && playConfetti();

  async function playConfetti() {
    await newConfetti({
      startVelocity: 40,
      origin: {
        y: 0.7, // Down from center slightly because they launch up
      }
    });
    play = false;
  }
</script>

<canvas bind:this={canvas} style="z-index: {play ? 100 : 'initial'};" />

<style>
  canvas {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
