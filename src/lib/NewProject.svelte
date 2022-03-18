<script>
  import Modal from "./Modal.svelte";
  import { user } from "./stores";
  import Tooltip from "./Tooltip.svelte";

  let open = false;

  let titleInput;
  let hasSameName = false;

  function randomColor() {
    return `#${Math.trunc(Math.random() * 0xffffff).toString(16).padEnd(6, '0')}`;
  }

  function addNewProject(e) {
    // @ts-ignore
    const data = Object.fromEntries((new FormData(document.forms.newProject)).entries());
    if (!data.title) {
      return;
    }
    e.preventDefault();
    if ($user.projects.find(project => project.title === data.title)) {
      hasSameName = true;
      return;
    }

    const newProject = {
      title: data.title,
      color: data.color,
      id: $user.nextId || 0,
    }

    $user.nextId++;

    $user.projects = [...$user.projects, newProject];
    open = false;
  }

</script>

<div class="relative">
  <button on:click={() => {
    open = !open;
    hasSameName = false;
    setTimeout(() => {
      titleInput.focus();
    });
  }}>
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.7474 0V48M0 23.04H48" stroke="var(--btn-color)" stroke-width="5"/>
    </svg>
    Add a new project
  </button>
  <Modal bind:open>
    <h2>New project</h2>
    <br>
    <form action="" id="newProject"
      on:input={() => { hasSameName = false; }}
      on:submit={addNewProject}
    >
      <label for="title" class="relative">
        Project title:
        {#if hasSameName}
          <Tooltip>
            <p>Names must be unique</p>
          </Tooltip>
        {/if}
      </label>
      <input type="text" name="title" id="title" bind:this={titleInput} required>
      

      <label for="color">Color:</label>
      <input type="color" name="color" id="color" value={randomColor()}>

      <button>Add</button>
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
    display: grid;
    grid-template-columns: 10ch 1fr;
    gap: 2ch;
    justify-content: start;
  }

  form button {
    grid-column: span 2;
  }

  input[type=color] {
    cursor: pointer;
  }
</style>
