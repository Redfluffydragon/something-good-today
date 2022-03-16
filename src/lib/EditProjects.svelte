<script>
  import Modal from "./Modal.svelte";
  import { user } from "./stores";
  import DraggableProjectsList from "./DraggableProjectsList.svelte";

  let open = false;

  let selectedProject = null;
  $: selectedIndex = $user.projects.findIndex(p => p.id === selectedProject);

  let newColor = '#000000';
  let newTitle = '';

  function updateProject() {
    $user.projects[selectedIndex].color = newColor;
    $user.projects[selectedIndex].title = newTitle;
  }

  function deleteProject() {
    // Remove the current project with = so Svelte will update
    $user.projects = [...$user.projects.slice(0, selectedIndex), ...$user.projects.slice(selectedIndex + 1)];
  }

  // TODO be able to mark a project as finished and have it marked off today
  function finishProject() {
    if (!$user.finishedProjects) {
      $user.finishedProjects = [];
    }
    $user.finishedProjects.push($user.projects[selectedIndex]);
    deleteProject();
  }

  function reset() {
    selectedProject = null;
    newColor = ''
    newTitle = ''
  }
</script>

<div><button disabled={!$user.projects.length} on:click={() => { open = true; reset(); }}>Edit projects</button></div>

<Modal bind:open maxWidth="80ch">
  <h2>Edit projects</h2>
  <div class="flex">
    {#if $user.projects?.length}
      <DraggableProjectsList bind:items={$user.projects} bind:selectedProject bind:newColor bind:newTitle />
    {/if}
    <form on:input={updateProject} on:submit={e => {
      e.preventDefault();
      open = false;
    }}>
      <fieldset disabled={selectedIndex === -1}>
        <div class="flex">
          <input type="text" name="newTitle" id="newTitle" bind:value={newTitle}>
          <div>
            <label for="newColor">Color:</label>
            <input type="color" name="newColor" id="newColor" bind:value={newColor}>
          </div>
          <button on:click={finishProject}>Mark project as finished</button>
          <button class="danger-btn" on:click={deleteProject}>Delete project</button>
        </div>
      </fieldset>
    </form>
  </div>
  <div class="flex"><button on:click={() => { open = false; }}>Done</button></div>
</Modal>

<style>
  .flex {
    display: flex;
    flex-wrap: wrap;
    gap: 2ch;
    margin-bottom: 2ch;
    justify-content: center;
  }

  form {
    border: 2px solid black;
    padding: 2ch;
    border-radius: 16px;
  }

  fieldset {
    display: contents;
  }

  form .flex {
    flex-direction: column;
  }

  input[type=text] {
    width: 100%;
  }
</style>
