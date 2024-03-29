<script>
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { sortByActive } from './project-utils';
  import { user } from './stores';

  export let projects;

  // map to an object because the drag and drop needs an array of objects
  let items = projects.map(id => {
    return { id };
  });

  export let newColor;
  export let newTitle;
  export let selectedProject;

  const dropTargetStyle = {
    outline: 'rgba(150, 150, 150, 0.7) solid 2px',
  };

  function considerDnd(e) {
    items = e.detail.items;
  }

  function finalizeDnd(e) {
    items = e.detail.items;
    // map it back to an array of just numbers
    projects = items.map(item => item.id);
    reorderHistory();
  }

  function reorderHistory() {
    for (const entry of $user.history) {
      entry.projects.sort(sortByActive);
    }
    $user = $user;
  }
</script>

<ul
  use:dndzone={{ items, dropTargetStyle }}
  on:consider={considerDnd}
  on:finalize={finalizeDnd}
  aria-label="Reorder and edit your projects"
>
  {#each items as project (project.id)}
    <li
      class="relative"
      class:selected={selectedProject === project.id}
      animate:flip={{ duration: 300 }}
      aria-label="Reorder project {$user.projects[project.id]?.title}"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 11C25 13.7614 22.7614 16 20 16C17.2386 16 15 13.7614 15 11C15 8.23858 17.2386 6 20 6C22.7614 6 25 8.23858 25 11Z"
          fill="black"
        />
        <path
          d="M48 11C48 13.7614 45.7614 16 43 16C40.2386 16 38 13.7614 38 11C38 8.23858 40.2386 6 43 6C45.7614 6 48 8.23858 48 11Z"
          fill="black"
        />
        <path
          d="M25 32C25 34.7614 22.7614 37 20 37C17.2386 37 15 34.7614 15 32C15 29.2386 17.2386 27 20 27C22.7614 27 25 29.2386 25 32Z"
          fill="black"
        />
        <path
          d="M48 32C48 34.7614 45.7614 37 43 37C40.2386 37 38 34.7614 38 32C38 29.2386 40.2386 27 43 27C45.7614 27 48 29.2386 48 32Z"
          fill="black"
        />
        <path
          d="M25 53C25 55.7614 22.7614 58 20 58C17.2386 58 15 55.7614 15 53C15 50.2386 17.2386 48 20 48C22.7614 48 25 50.2386 25 53Z"
          fill="black"
        />
        <path
          d="M48 53C48 55.7614 45.7614 58 43 58C40.2386 58 38 55.7614 38 53C38 50.2386 40.2386 48 43 48C45.7614 48 48 50.2386 48 53Z"
          fill="black"
        />
      </svg>
      <button
        aria-label="Edit project {$user.projects[project.id]?.title}"
        class:clear-btn={selectedProject !== project.id}
        on:click={() => {
          selectedProject = project.id;
          newColor = $user.projects[project.id].color;
          newTitle = $user.projects[project.id].title;
        }}
      >
        {$user.projects[project.id]?.title}
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
    width: 100%;
    text-align: left;
  }

  svg {
    filter: invert(var(--invert));
    position: absolute;
    top: 50%;
    transform: translate(0.6em, -50%);
    z-index: 1;
  }

  .selected svg {
    filter: none;
  }
</style>
