<svelte:head>
  <title>Something Good</title>
</svelte:head>

<script>
  import Card from "$lib/Card.svelte";
  import NewProject from "$lib/NewProject.svelte";
  import EditProjects from "$lib/EditProjects.svelte";
  import PieChart from "$lib/PieChart.svelte";
  import { firebaseConfig, name, user } from "$lib/stores";
  import { onMount } from "svelte";
  import { initializeApp } from 'firebase/app';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import { browser } from "$app/env";
  
  export let fetchedUser;
  $user = fetchedUser;

  let firebaseApp;
  let db;

  let completedToday;
  let updateDelay;

  $: browser && waitUpdateUser(db, $user);

  // @ts-ignore
  $: browser && $user.projects && (completedToday = [...(new FormData(document.forms.projects)).entries()]
                  .map(selected => $user.projects[parseInt(selected[1])]))

  onMount(() => {
    // Have to initialize app on client-side it seems
    // Even though the app is also initialized in the endpoint
    firebaseApp = initializeApp($firebaseConfig);
    db = getFirestore();
  });

  /**
  * @param {import("@firebase/firestore").Firestore} db
  * @param {Object} user
  */
  async function updateUser(db, user) {
    if (!db) {
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.name), user, { merge: true });

      console.log('Updated', user.name);
    } catch (err) {
      console.log('Failed to update:', err);
    }

  }

  /**
* Every time this is called, it further delays updateUser by 1 second
* @param {import("@firebase/firestore").Firestore} db
* @param {Object} user
*/
  function waitUpdateUser(db, user) {
    clearTimeout(updateDelay);
    updateDelay = setTimeout(() => {
      updateUser(db, user);
    }, 1000);
  }

  /**
   * @param {string} title
  */
  function titleToId(title) {
    return title.toLowerCase().replace(/\s/g, '-');
  }
</script>

<main>
  {#if $user.name}
    <h1>Hi, {$user.name}!</h1>
  {:else}
    <h1>Hello!</h1>
  {/if}
  
  <div class="main-content">
    <div class="chart">
      <Card>
        <h1>Today</h1>
        <PieChart goal={$user.goal} projects={completedToday} />
      </Card>
    </div>
    
    <Card>
      <div class="sidebar">
        <div>
          <h2>Active Projects:</h2>
          {#if $user.projects?.length}
            <form name="projects" on:submit={e => { e.preventDefault() }}
              on:input={() => {
                // @ts-ignore
                completedToday = [...(new FormData(document.forms.projects)).entries()]
                  .map(selected => $user.projects[parseInt(selected[1])]);
              }}>
              <ul>
                {#each $user.projects as project, i}
                  <li>
                    <input type="checkbox" 
                      name={titleToId(project.title)} 
                      id={titleToId(project.title)}
                      value={i}
                    >
                    <label for={titleToId(project.title)}>{project.title}</label>
                    <span class="color" style="background: {project.color};"></span>
                  </li>
                {/each}
              </ul>
            </form>
          {:else}
            <p>You don't have any projects.</p>
          {/if}
        </div>

        <NewProject />
        <EditProjects />

        <h2>Goal:</h2>
        <select name="goal" id="goal" bind:value={$user.goal}>
          <option value="1" selected>One project every day</option>
          <option value="2">Two projects every day</option>
          <option value="3">Three projects every day</option>
          <option value="4">Four projects every day</option>
          <option value="5">Five projects every day</option>
        </select>
      </div>
    </Card>
  </div>

  <div class="history">
    <Card>
      <h2>History</h2>
      {#if $user.history?.length}
        {$user.history}
      {:else}
        <p>No history</p>
      {/if}
    </Card>
  </div>
</main>

<style>
  main {
    margin: 18px;
  }

  .main-content {
    display: flex;
    gap: 2ch;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    place-content: stretch;
    margin-bottom: 2ch;
    justify-content: center;
  }

  .main-content > * {
    flex: 1;
    max-width: 100%;
  }

  .chart {
    min-width: min(30ch, 100%);
  }

  .sidebar {
    max-width: 40ch;
    display: flex;
    flex-direction: column;
    gap: 2ch;
  }

  ul {
    list-style: none;
    padding-inline-start: 25px;
  }

  .color {
    height: 1em;
    width: 1em;
    display: inline-block;
  }
</style>
