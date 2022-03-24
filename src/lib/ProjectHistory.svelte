<script>
  import Card from "./Card.svelte";
  import PieChart from "./PieChart.svelte";
  import { user } from "./stores";

</script>

<Card>
  <h2>History</h2>
  {#if $user.history?.length}
    <ul>
      {#each $user.history.sort((a, b) => b.date - a.date) as day(day.date)}
        <li>
          {(new Date(day.date)).toLocaleDateString()}
          <PieChart projects={day.projects} goal={day.goal} size="15ch" />
        </li>
      {/each}
    </ul>
  {:else}
    <p>No history.</p>
  {/if}
</Card>

<style>
  ul {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    gap: 2ch;
  }

  li {
    max-width: 15ch;
    text-align: center;
  }
</style>
