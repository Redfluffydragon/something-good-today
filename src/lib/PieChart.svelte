<script>
  import { Chart, PieController, ArcElement, Tooltip } from 'chart.js';
  import { onMount } from 'svelte';
  import { user } from './stores';

  export let projects = [];
  export let goal = 1;
  export let size = '40ch';

  export let id = 'none';

  // I want the pie charts to animate in on first load, they get updated 2 or 3
  // times before actually displaying something. The main "Today" one gets
  // updated 3 times, and all the history ones get updated twice. I don't know why,
  // so this is a really hacky fix for it.
  const dumbUpdateLimit = id === 'main' ? 3 : 2;

  let canvas;

  let pieChart;
  let data;
  const HOVER_OFFSET = 15;

  let oldLength = 0;
  let oldGoal = goal;

  let numUpdates = 0;

  $: updateData(projects, goal);

  onMount(() => {
    Chart.register(PieController, ArcElement, Tooltip);

    pieChart = new Chart(canvas, {
      type: 'pie',
      data: data,
      options: {
        layout: {
          padding: HOVER_OFFSET,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: item => item.label,
            },
          },
        },
      },
    });
  });

  /**
   * @param {number} goal
   */
  function updateData(projects, goal) {
    if (!projects) {
      return;
    }

    const bgColors = [];
    const getLabels = [];

    for (const id of projects) {
      getLabels.push($user.projects[id]?.title);
      bgColors.push($user.projects[id]?.color);
    }

    const sizes = Array(getLabels.length).fill(1);
    data = {
      labels: getLabels,
      datasets: [
        {
          backgroundColor: bgColors,
          hoverOffset: HOVER_OFFSET,
          clip: 100,
          borderWidth: 0,
          circumference: 360 * Math.min(sizes.length / goal, 1),
          data: sizes,
        },
      ],
    };

    pieChart && (pieChart.data = data);

    // Don't animate unless adding or removing a project
    // Don't animate when changing colors, for example
    pieChart?.update(oldLength !== projects.length || oldGoal !== goal || numUpdates <= dumbUpdateLimit ? '' : 'none');

    numUpdates <= dumbUpdateLimit && numUpdates++;

    oldGoal = goal;
    oldLength = projects.length;
  }

  function listProjects(projects) {
    return projects?.map(id => $user.projects[id].title).join(', ') || 'none';
  }
</script>

<div class="relative" style="max-width: {size};">
  {#if !projects || !Object.keys(projects).length}
    <p>Nothing yet today.</p>
  {/if}

  <canvas bind:this={canvas} aria-label="Completed projects: {listProjects(projects)}" />
</div>

<style>
  div {
    aspect-ratio: 1;
    margin: 0 auto;
  }

  p {
    text-align: center;
    position: absolute;
    width: 100%;
  }
</style>
