<script>
  import { browser } from "$app/env";
  import Card from "./Card.svelte";
  import PieChart from "./PieChart.svelte";
  import { historyShown, user } from "./stores";
  import dayjs from 'dayjs';

  $: browser && localStorage.setItem('historyShown', JSON.stringify($historyShown));
</script>

<Card>
  <div class="header">
    <h2>History</h2>
    <div>
      <label for="historyAmount">Show: </label>
      <select id="historyAmount" bind:value={$historyShown}>
        <option value={7}>Past week</option>
        <option value={dayjs().daysInMonth()}>Past month</option>
        <option value={365}>Past year</option>
        <option value={undefined}>All</option>
      </select>
    </div>
  </div>
  {#if $user.history?.length}
    <ul>
      {#each $user.history.slice(0, $historyShown) as day(day.date)}
        <li>
          {(new Date(day.date)).toLocaleDateString()}
          <PieChart projects={day.projects} goal={day.goal} size="12ch" />
        </li>
      {/each}
    </ul>
  {:else}
    <p>No history.</p>
  {/if}
</Card>

<style>
  h2 {
    line-height: 1;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    gap: 2ch;
    margin-bottom: 2ch;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12ch, 1fr));
    place-items: center;
    gap: 2ch;
    text-align: center;
  }
</style>
