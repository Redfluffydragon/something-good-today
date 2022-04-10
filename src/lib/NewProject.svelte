<script>
  import { tick } from 'svelte';
  import Modal from './Modal.svelte';
  import { user } from './stores';

  let open = false;

  let titleInput;

  /**
   * Return a random hex color
   */
  function randomColor() {
    return `#${Math.trunc(Math.random() * 0xffffff)
      .toString(16)
      .padEnd(6, '0')}`;
  }

  /**
   * Add a new project
   * @param {Event} e A form submit event to get formdata from
   */
  function addNewProject(e) {
    const data = Object.fromEntries(new FormData(document.forms.newProject).entries());

    // Check if the title field is filled out before preventDefault - this way it still uses the browser's built-in form validation
    if (!data.title) {
      return;
    }
    e.preventDefault();

    const newProject = {
      title: data.title,
      color: data.color,
      id: $user.nextId || 0,
    };

    $user.projects[$user.nextId] = newProject;
    $user.activeProjects.push($user.nextId);

    $user.nextId++;

    $user = $user; // So Svelte updates and triggers sync

    open = false;
  }
</script>

<div class="relative">
  <button
    aria-expanded="false"
    on:click={async () => {
      open = !open;

      await tick();
      titleInput.focus();
    }}
  >
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.7474 0V48M0 23.04H48" stroke="var(--btn-color)" stroke-width="5" />
    </svg>
    Add a new project
  </button>
  <Modal title="New project" bind:open>
    <br />
    <form id="newProject" class="grid" on:submit={addNewProject}>
      <label for="title" class="relative">Title:</label>
      <input type="text" name="title" id="title" aria-label="Project title" bind:this={titleInput} required />

      <label for="color">Color:</label>
      <input type="color" name="color" id="color" aria-label="Project color" value={randomColor()} />

      <button aria-label="Add the new project">Add</button>
    </form>
  </Modal>
</div>

<style>
  svg {
    display: inline;
    height: 0.8em;
    margin-left: -0.5ch;
  }

  form {
    grid-template-columns: 10ch 1fr;
    justify-content: start;
  }

  form button {
    grid-column: span 2;
  }

  input[type='color'] {
    cursor: pointer;
  }
</style>
