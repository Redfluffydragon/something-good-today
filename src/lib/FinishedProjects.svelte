<script>
  import Project from './Project.svelte';
  import { user } from './stores';
</script>

<section aria-labelledby="finished-header">
  <h2 id="finished-header">Finished Projects</h2>
  {#if $user.finishedProjects?.length}
    <ul>
      {#each $user.finishedProjects as id (id)}
        <li>
          <button
            title="Mark as unfinished"
            class="clear-btn"
            on:click={() => {
              $user.activeProjects.push(id);
              $user.finishedProjects.splice($user.finishedProjects?.indexOf(id), 1);
              $user = $user; // So Svelte updates
            }}
          >
            <Project {id} />
          </button>
        </li>
      {/each}
    </ul>
    <i>Click to mark as unfinished</i>
  {:else}
    <p>No finished projects.</p>
  {/if}
</section>

<style>
  .clear-btn {
    padding: 1ch;
  }
</style>
