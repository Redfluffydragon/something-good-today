<script>
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';

  export let items;

  export let newColor;
  export let newTitle;
  export let selectedProject;

  function handleDnd(e) {
    items = e.detail.items;
  }
</script>

<ul use:dndzone={{items}} on:consider="{handleDnd}" on:finalize="{handleDnd}">
  {#each items as project(project.id)}
    <li animate:flip={{duration: 300}}>
      <button class:selected={selectedProject === project.id} on:click={() => {
        selectedProject = project.id;
        newColor = project.color;
        newTitle = project.title;
      }}>
        {project.title}
      </button>
    </li>
  {/each}
</ul>

<style>
  ul {
    max-width: 40ch;
    padding: 1ch;
    margin-left: 2px;
    border-radius: var(--border-radius);
  }

  button {
    padding-left: 2em;
  }

  li::before {
    content: url('drag.svg');
    position: absolute;
    transform: translate(0.5em, 0.75em);
  }
</style>
