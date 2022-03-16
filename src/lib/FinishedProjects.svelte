<script>
  import Project from "./Project.svelte";
  import { user } from "./stores";

</script>

<h2>Finished Projects:</h2>
{#if $user.finishedProjects?.length}
  <ul>
    {#each $user.finishedProjects as finishedProject, i}
      <li>
        <button title="Mark as unfinished" class="clearBtn" on:click={() => {
          $user.projects = [...$user.projects, $user.finishedProjects[i]];
          $user.finishedProjects = [...$user.finishedProjects.slice(0, i), ...$user.finishedProjects.slice(i + 1)];
        }}>
          <Project color={finishedProject.color}>{finishedProject.title}</Project>
        </button>
      </li>
    {/each}
  </ul>
  <i>Click to mark as unfinished</i>
{:else}
  <p>No finished projects</p>
{/if}
