<script>
  import Modal from "./Modal.svelte";
  import { projects } from "./stores";

  let open = false;

  let selectedProject = -1;
  let newColor;
  let newTitle = '';

  function updateProject() {
    $projects[selectedProject].color = newColor;
    $projects[selectedProject].title = newTitle;
  }

  function deleteProject(e) {
    e.preventDefault();
    // Remove the current project with = so Svelte will update
    $projects = [...$projects.slice(0, selectedProject), ...$projects.slice(selectedProject + 1)];
  }
</script>

<button on:click={() => { open = true; }}>Edit projects</button>

<Modal bind:open maxWidth="80ch">
  <h2>Edit projects</h2>
  <div class="flex">
    {#if $projects?.length}
      <ul>
        {#each $projects as project, i}
          <li>
            <button on:click={() => {
              selectedProject = i;
              newColor = project.color;
              newTitle = project.title;
            }}>
              {project.title}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    <form on:input={updateProject} on:submit={e => {
      e.preventDefault();
      open = false;
    }}>
      <fieldset disabled={selectedProject === -1}>
        <div class="flex">
          <input type="text" name="newTitle" id="newTitle" bind:value={newTitle}>
          <div>
            <label for="newColor">Color:</label>
            <input type="color" name="newColor" id="newColor" bind:value={newColor}>
          </div>
          <button>Mark project as done</button>
          <button on:click={deleteProject}>Delete project</button>
        </div>
      </fieldset>
    </form>
  </div>
  <button on:click={() => { open = false; }}>Done</button>
</Modal>

<style>
  .flex {
    display: flex;
    gap: 2ch;
  }

  ul button {
    background: transparent;
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
    width: 40ch;
  }
</style>
