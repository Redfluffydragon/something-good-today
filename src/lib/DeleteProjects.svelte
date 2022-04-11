<script>
  import { tick } from 'svelte';
  import Modal from './Modal.svelte';
  import Project from './Project.svelte';
  import ProjectsChecklist from './ProjectsChecklist.svelte';
  import { user } from './stores';

  let open = false;

  let deletedSelected = [];

  let permaDeleteOpen = false;
</script>

<button
  class="danger-btn"
  on:click={() => {
    open = true;
  }}>Manage deleted projects</button
>

<Modal title="Deleted projects" bind:open>
  <div class="flex flex-column">
    {#if $user.deletedProjects.length}
      <ProjectsChecklist
        name="deleted"
        projects={$user.deletedProjects}
        bind:selected={deletedSelected}
      />
    {:else}
      <p>No deleted projects.</p>
    {/if}
    <br />
    <button
      disabled={!deletedSelected.length}
      on:click={() => {
        $user.deletedProjects = $user.deletedProjects.filter(id => !deletedSelected.includes(id));
        $user.activeProjects = [...$user.activeProjects, ...deletedSelected];
      }}
      >Recover selected projects
    </button>
    <button
      disabled={!deletedSelected.length}
      class="danger-btn"
      on:click={() => {
        permaDeleteOpen = true;
      }}
    >
      Permanently delete selected projects
    </button>

    <button
      class="done-btn"
      on:click={() => {
        open = false;
      }}>Done</button
    >
  </div>
</Modal>

<Modal title="Permanently delete projects" bind:open={permaDeleteOpen}>
  <div class="flex flex-column">
    <p>Are you sure you want to permanently delete the following projects?</p>
    <ul class="real-list">
      {#each deletedSelected as id}
        <li><Project {id} /></li>
      {/each}
    </ul>
    <p>This action cannot be undone.</p>
    <div class="flex center">
      <button
        on:click={() => {
          permaDeleteOpen = false;
        }}>Cancel</button
      >
      <button
        class="danger-btn"
        on:click={async () => {
          $user.deletedProjects = $user.deletedProjects.filter(id => !deletedSelected.includes(id));
          // await tick so the list of deleted projects doesn't freak out
          await tick();
          deletedSelected.forEach(id => {
            delete $user.projects[id];
          });
          permaDeleteOpen = false;
        }}>Delete</button
      >
    </div>
  </div>
</Modal>

<style>
  .done-btn {
    align-self: center;
  }

  .real-list {
    list-style: disc;
    padding-inline-start: 40px;
  }

  .center {
    place-content: center;
  }
</style>
