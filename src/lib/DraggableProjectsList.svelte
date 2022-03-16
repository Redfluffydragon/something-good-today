<script>
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';

  export let items;

  export let newColor;
  export let newTitle;
  export let selectedProject;

  function handleDndConsider(e) {
    items = e.detail.items;
  }

  function handleDndFinalize(e) {
    items = e.detail.items;
  }
</script>

<ul use:dndzone={{items}} on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
  {#each items as project(project.id)}
    <li animate:flip={{duration: 300}}>
      <button class:selected={selectedProject === project.id} on:click={() => {
        selectedProject = items.findIndex(p => p.id === project.id);
        newColor = project.color;
        newTitle = project.title;
      }}>
        {project.title}
      </button>
    </li>
  {/each}
</ul>

<style>
  button:not(.selected) {
    background: transparent;
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
