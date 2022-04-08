<script>
  import { browser } from '$app/env';
  import PieChart from './PieChart.svelte';
  import { historyShown, user } from './stores';
  import dayjs from 'dayjs';
  import Modal from './Modal.svelte';
  import ProjectsChecklist from './ProjectsChecklist.svelte';
  import GoalSelect from './GoalSelect.svelte';

  $: browser && localStorage.setItem('historyShown', $historyShown);

  let editing = false;
  let open = false;
  let dateToEdit;

  let editingActive = [];
  let editingFinished = [];

  function updateHistory() {
    $user.history[dateToEdit].projects = [...editingActive, ...editingFinished];
  }

  $: streak = $user.history?.findIndex(day => day.projects.length < parseInt(day.goal)) || 0;

  $: maxStreak = findMaxStreak($user.history);

  function findMaxStreak(history) {
    if (!history) {
      return 0;
    }
    const streaks = [];
    let currentStreak = 0;
    for (const day of history) {
      if (day.projects.length >= parseInt(day.goal)) {
        currentStreak++;
      } else if (currentStreak !== 0) {
        streaks.push(currentStreak);
        currentStreak = 0;
      }
    }
    return Math.max(...streaks);
  }

  const pluralDays = count => `day${count === 1 ? '' : 's'}`;
</script>

<div class="header flex">
  <h2>History</h2>

  <div class="space-right">
    <label for="historyAmount">Show: </label>
    <select id="historyAmount" bind:value={$historyShown}>
      <option value="7" selected>Past week</option>
      <option value={dayjs().daysInMonth().toString()}>Past month</option>
      <option value="365">Past year</option>
      <option value="Infinity">All</option>
    </select>
  </div>

  {#if $user.showStreak}
    <p>Current streak: {streak} {pluralDays(streak)}</p>
  {/if}

  {#if $user.showMaxStreak}
    <p>Max streak: {maxStreak} {pluralDays(maxStreak)}</p>
  {/if}

  <button
    title="Edit history"
    aria-label="Edit history"
    on:click={() => {
      editing = !editing;
    }}>{editing ? 'Done' : 'Edit'}</button
  >
</div>

{#if $user.history?.length}
  <ul class="grid">
    {#each $user.history.slice(0, $historyShown) as day, i (day.date)}
      <li class="relative">
        {new Date(day.date).toLocaleDateString()}
        <PieChart projects={day.projects} goal={day.goal} size="12ch" />
        {#if editing}
          <button
            on:click={() => {
              open = true;
              dateToEdit = i;
            }}
            class="edit-history clear-btn"
            aria-label="Edit history on {new Date(day.date).toLocaleDateString()}">Edit</button
          >
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p>No history.</p>
{/if}

<Modal title="Edit {new Date($user.history?.[dateToEdit]?.date)?.toLocaleDateString()}" bind:open>
  <div class="flex flex-column">
    <div>
      <GoalSelect bind:goal={$user.history[dateToEdit].goal} />
    </div>
    <h3>Active projects</h3>
    <ProjectsChecklist
      name="editing-active"
      bind:selected={editingActive}
      projects={$user.activeProjects}
      isSelected={id => $user.history[dateToEdit].projects.includes(id)}
      on:input={updateHistory}
    />
    <h3>Finished Projects</h3>
    <ProjectsChecklist
      name="editing-finished"
      bind:selected={editingFinished}
      projects={$user.finishedProjects}
      isSelected={id => $user.history[dateToEdit].projects.includes(id)}
      on:input={updateHistory}
    />
    <button
      on:click={() => {
        open = false;
      }}>Done</button
    >
  </div>
</Modal>

<style>
  h2 {
    line-height: 1;
  }

  .header {
    flex-wrap: wrap;
    margin-bottom: 2ch;
    align-items: center;
  }

  .clear-btn {
    padding: 0;
  }

  .space-right {
    margin-right: auto;
  }

  ul {
    grid-template-columns: repeat(auto-fill, minmax(12ch, 1fr));
    place-items: center;
    text-align: center;
  }

  li {
    width: 100%;
  }

  .edit-history {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--shadow);
    text-align: center;
  }
</style>
