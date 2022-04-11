<script>
  import { Chart, PieController, ArcElement, Tooltip } from 'chart.js';
  import { onMount } from 'svelte';
  import { reducedMotion, user } from './stores';

  export let projects = [];
  export let goal = 1;
  export let size = '40ch';

  export let noneMessage = 'No projects.';

  // I want the pie charts to animate in on first load, they get updated 2 or 3
  // times before actually displaying something. The main "Today" one gets
  // updated 3 times, and all the history ones get updated twice. I don't know why,
  // so this is a really hacky fix for it.
  export let dumbUpdateLimit = 2;

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
   * Convert an HSV value to a single R, G, or B value depending on the number
   * @param {number} h hue
   * @param {number} s saturation
   * @param {number} v value
   * @param {5|3|1} number 5/3/1 calculates r/g/b repectively
   * @returns {string} a 2-digit hex number
   */
  function hsvToHex(h, s, v, number) {
    const k = (number + h / 60) % 6;
    return ('0' + Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255).toString(16)).slice(-2);
  }

  /**
   * Intensify a hex color by the multiplier (converts to HSV and increases saturation and value)
   * @param {string} color A six-digit hex color with #
   * @param {number} multiplier number to multiply the saturation and value by
   * @returns {string} A new hex color
   */
  function intensifyColor(color, multiplier) {
    const [r, g, b] = color.match(/([a-f|0-9]{2})/gi).map(color => parseInt(color, 16));

    const max = Math.max(r, g, b);

    // chroma
    const c = max - Math.min(r, g, b);

    // hue
    const hPrime = c === 0 ? 0 : max === r ? ((g - b) / c) % 6 : max === g ? (b - r) / c + 2 : (r - g) / c + 4;

    const h = (360 + Math.round(hPrime * 60)) % 360;

    // value with multiplier
    const v = Math.min((max / 255) * multiplier, 1);

    // saturation with multiplier
    const s = Math.min((v === 0 ? 0 : c / v / 255) * multiplier, 1);

    // back to hex
    return `#${hsvToHex(h, s, v, 5)}${hsvToHex(h, s, v, 3)}${hsvToHex(h, s, v, 1)}`;
  }

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
      getLabels.push($user.projects[id].title);
      bgColors.push(intensifyColor($user.projects[id].color, $user.darkMode ? Math.min($user.options.colorFilter, 1) : Math.max($user.options.colorFilter, 1)));
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
    pieChart?.update(!$reducedMotion && (oldLength !== projects.length || oldGoal !== goal || numUpdates <= dumbUpdateLimit) ? '' : 'none');

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
    <p>{noneMessage}</p>
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
