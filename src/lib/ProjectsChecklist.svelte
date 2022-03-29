<script>
import { createEventDispatcher } from "svelte";

  import { sortByActive } from "./project-utils";
  import Project from "./Project.svelte";
  import { user } from "./stores";

  /** @type {function(int):bool} A callback function that determines whether each project starts selected based on the project id */
  export let isSelected;

  /** @type {array} The projects to list */
  export let projects = $user.activeProjects;

  /** @type {array} An array of the selected projects' IDs */
  export let selected;
  selected = projects.filter(isSelected); // Start it with the already selected projects

  /** @type {string} A unique name to tell forms apart if there's more than one in the DOM at once */
  export let name;

  // internally, use a Set to keep track of selected projects. Have to use an array for Firestore (I think, there's not a Set option anyway)
  let _selected = new Set(selected);

  const dispatch = createEventDispatcher();

  /**
   * @param {string} title
  */
  function titleToId(title) {
    return title.toLowerCase().replace(/\s/g, '-');
  }
</script>

<form {name} id={name} on:submit={e => { e.preventDefault() }}
  on:input={e => {
    const form = e.target.closest('#' + name);

    // get all checkboxes in the current form
    const checkboxes = [...form.querySelectorAll('input[type=checkbox]')];
    
    // add or delete the project IDs based on whether the corresponding checkbox is checked
    // do it this way because it won't remove finished projects from the today array
    checkboxes.forEach(checkbox => _selected[checkbox.checked ? 'add' : 'delete'](parseInt(checkbox.value)));

    // Transform back into an array for external, and sort according to the active projects (inactive projects are sorted to the end)
    selected = [..._selected].sort(sortByActive);

    dispatch('input', e);
  }}>
  <ul>
    {#each projects as id(id)}
      <li>
        <input type="checkbox"
          name={titleToId($user.projects[id].title)}
          id="{name}-{titleToId($user.projects[id].title)}"
          value={id}
          checked={isSelected(id)}
        >
        <label for="{name}-{titleToId($user.projects[id].title)}">
          <Project color={$user.projects[id].color}>{$user.projects[id].title}</Project>
        </label>
      </li>
    {/each}
  </ul>
</form>

<style>
  ul {
    padding-inline-start: 25px;
  }

  li label {
    cursor: pointer;
  }
</style>
