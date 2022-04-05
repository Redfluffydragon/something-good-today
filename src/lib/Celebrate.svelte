<script>
  import confetti from 'canvas-confetti';
  import { onMount } from 'svelte';
  import fireworks from './fireworks';

  export let play;

  export let type = 'fireworks';

  let canvas;
  let newConfetti;
  let newFireworks;

  onMount(() => {
    newConfetti = confetti.create(canvas, {
      resize: true,
    });

    newFireworks = fireworks.create(canvas);
  });

  $: play && playCelebration();

  async function playCelebration() {
    if (type === 'confetti') {
      await newConfetti({
        startVelocity: 40,
        origin: {
          y: 0.7, // Down from center slightly because they launch up
        },
      });
    } else if (type === 'fireworks') {
      await newFireworks({
        origin: {
          y: 0.3,
          x: 0.5,
        },
      });
    }

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
