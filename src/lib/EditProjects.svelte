<script>
  import Modal from './Modal.svelte';
  import { shouldUpdate, user } from './stores';
  import DraggableProjectsList from './DraggableProjectsList.svelte';

  let open = false;

  let selectedProject = null;

  let newColor = '#000000';
  let newTitle = '';

  function updateProject() {
    $user.projects[selectedProject].color = newColor;
    $user.projects[selectedProject].title = newTitle;
  }

  function deleteProject() {
    $user.deletedProjects.push(selectedProject);
    $user.activeProjects.splice($user.activeProjects.indexOf(selectedProject), 1);
    $user = $user; // So Svelte updates
  }

  function finishProject() {
    $user.finishedProjects.push(selectedProject);
    $user.activeProjects.splice($user.activeProjects.indexOf(selectedProject), 1);
    $user = $user; // So Svelte updates
  }

  function reset() {
    selectedProject = null;
    newColor = '';
    newTitle = '';
  }
</script>

<div>
  <button
    disabled={!$user.activeProjects?.length}
    on:click={() => {
      open = true;
      $shouldUpdate = false;
      reset();
    }}>Edit projects</button
  >
</div>

<Modal title="Edit projects" bind:open maxWidth="80ch">
  <div class="flex flex-column">
    <div class="flex">
      {#if $user.activeProjects?.length}
        <DraggableProjectsList bind:projects={$user.activeProjects} bind:selectedProject bind:newColor bind:newTitle />
      {/if}
      <form
        on:input={updateProject}
        on:submit={e => {
          e.preventDefault();
          open = false;
        }}
      >
        <fieldset disabled={selectedProject === null}>
          <div class="flex flex-column">
            <input type="text" name="newTitle" id="newTitle" bind:value={newTitle} />
            <div>
              <label for="newColor">Color:</label>
              <input type="color" name="newColor" id="newColor" bind:value={newColor} />
            </div>
            <button on:click={finishProject}>Mark project as finished</button>
            <button class="danger-btn" on:click={deleteProject}>Delete project</button>
          </div>
        </fieldset>
      </form>
    </div>
    <div class="flex">
      <button
        on:click={() => {
          open = false;
        }}>Done</button
      >
    </div>
  </div>
</Modal>

<style>
  .flex {
    flex-wrap: wrap;
    justify-content: center;
  }

  form {
    border: 2px solid black;
    padding: 2ch;
    border-radius: var(--border-radius);
  }

  fieldset {
    display: contents;
  }

  input[type='text'] {
    width: 100%;
  }
</style>
