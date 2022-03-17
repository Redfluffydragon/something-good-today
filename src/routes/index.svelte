<svelte:head>
  <title>Something Good</title>
</svelte:head>

<script>
  import Card from "$lib/Card.svelte";
  import NewProject from "$lib/NewProject.svelte";
  import EditProjects from "$lib/EditProjects.svelte";
  import PieChart from "$lib/PieChart.svelte";
  import { firebaseConfig, user } from "$lib/stores";
  import { onMount } from "svelte";
  import { initializeApp } from 'firebase/app';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import { browser } from "$app/env";
  import FinishedProjects from "$lib/FinishedProjects.svelte";
  import Project from "$lib/Project.svelte";
  import { beforeNavigate } from "$app/navigation";
  
  export let fetchedUser;
  $user = fetchedUser;

  let firebaseApp;
  let db;

  let updateDelay;
  let firstLoad = true;

  $: browser && waitUpdateUser($user);

  onMount(() => {
    // Have to initialize app on client-side it seems
    // Even though the app is also initialized in the endpoint
    firebaseApp = initializeApp($firebaseConfig);
    db = getFirestore();
  });

  beforeNavigate(async () => {
    await updateUser($user);
  });

  /**
   * @param {Object} user
  */
  async function updateUser(user) {
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
   * Every time this is called, it further delays updateUser by 10 seconds
   * @param {Object} user
  */
  function waitUpdateUser(user) {
    if (firstLoad) {
      firstLoad = false;
      return;
    }

    clearTimeout(updateDelay);
    updateDelay = setTimeout(() => {
      updateUser(user);
    }, 10000);
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
        <PieChart goal={$user.goal} projects={$user.today} />
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
                $user.today = [...(new FormData(document.forms.projects)).entries()]
                  .map(selected => $user.projects[parseInt(selected[1])]);
              }}>
              <ul>
                {#each $user.projects as project, i}
                  <li>
                    <input type="checkbox" 
                      name={titleToId(project.title)} 
                      id={titleToId(project.title)}
                      value={i}
                      checked={$user.today?.find((p) => p.id === project.id)}
                    >
                    <label for={titleToId(project.title)}>
                      <Project color={project.color}>{project.title}</Project>
                    </label>
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

  <Card>
    <FinishedProjects />
  </Card>
</main>

<style>
  main {
    margin: 18px;
    display: flex;
    flex-direction: column;
    gap: 2ch;
  }

  .main-content {
    display: flex;
    gap: 2ch;
    flex-wrap: wrap;
    flex-direction: row-reverse;
  }

  .main-content > * {
    max-width: 100%;
  }

  .chart {
    min-width: min(30ch, 100%);
    flex: 2;
  }

  .sidebar-wrapper {
    flex: 1;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 2ch;
  }

  ul {
    padding-inline-start: 25px;
  }

  li label {
    cursor: pointer;
  }
</style>
