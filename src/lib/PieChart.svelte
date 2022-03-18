<script>
  import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
  import { onMount } from 'svelte';

  export let projects = [];
  export let goal = 1;

  let canvas;

  let pieChart;
  let data;
  let getLabels = [];
  let bgColors = [];
  let sizes = [];
  const HOVER_OFFSET = 15;

  let oldLength = projects.length;
  let oldGoal = goal;

  /**
  * @param {number} goal
  */
  function updateData(goal) {
    data = {
      labels: getLabels,
      datasets: [{
        label: 'Today',
        backgroundColor: bgColors,
        hoverOffset: HOVER_OFFSET,
        clip: 100,
        borderWidth: 0,
        circumference: 360 * Math.min(sizes.length / goal, 1),
        data: sizes,
      }],
    };

    pieChart && (pieChart.data = data);

    // Don't animate unless adding or removing a project
    // Don't animate when changing colors, for example
    pieChart?.update((oldLength !== projects.length || oldGoal !== goal) ? '' : 'none');

    oldGoal = goal;
    oldLength = projects.length;
  }

  /**
   * @param {any[]} projects
   * @param {number} goal
  */
  function getData(projects, goal) {
    if (!projects) {
      return;
    }

    bgColors.length = 0;
    getLabels.length = 0;
    for (const project of projects) {
      getLabels = [...getLabels, project.title];
      bgColors = [...bgColors, project.color];
    }
    sizes = Array(getLabels.length).fill(1);
    sizes = Array(getLabels.length).fill(1);

    updateData(goal);
  }

  $: getData(projects, goal);

  onMount(() => {
    Chart.register(PieController, ArcElement, Tooltip);

    pieChart = new Chart(canvas, {
      type: 'pie',
      data: data,
      options: {
        layout: {
          padding: HOVER_OFFSET,
        }
      }
    });
  });
</script>

<div class="relative">
  {#if !projects || !Object.keys(projects).length}
    <p>Nothing yet today.</p>
  {/if}

  <canvas bind:this={canvas}></canvas>
</div>

<style>
  div {
    max-width: 40ch;
    aspect-ratio: 1;
    margin: 0 auto;
  }

  p {
    text-align: center;
    position: absolute;
    width: 100%;
  }
</style>
