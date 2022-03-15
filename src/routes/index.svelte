<svelte:head>
  <title>Something Good</title>
</svelte:head>

<script>
  import Card from "$lib/Card.svelte";
  import NewProject from "$lib/NewProject.svelte";
  import EditProjects from "$lib/EditProjects.svelte";
  import PieChart from "$lib/PieChart.svelte";
  import { name, projects } from "$lib/stores";
  import { onMount } from "svelte";
  import { initializeApp } from 'firebase/app';
  import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
  import { browser } from "$app/env";
  
  // export let projects;
  export let history = [];

  const firebaseConfig = {
    apiKey: "AIzaSyAHCt552UgH7VJGxjiFJlH1D0iLYxuE8iQ",
    authDomain: "something-good-70b39.firebaseapp.com",
    projectId: "something-good-70b39",
    storageBucket: "something-good-70b39.appspot.com",
    messagingSenderId: "805543978877",
    appId: "1:805543978877:web:d425996272cc609a368e14"
  };

  let firebaseApp;
  let db;
  let fetched = false;

  let completedToday;
  let goal = 1;
  let updateDelay;

  $: browser && waitUpdateUser($name, $projects, goal);

 // @ts-ignore
  $: browser && $projects && (completedToday = [...(new FormData(document.forms.projects)).entries()]
                  .map(selected => $projects[parseInt(selected[1])]))

  onMount(() => {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore();

    getUser($name);
  });

  /**
  * @param {string} name
  */
  async function getUser(name) {
    const user = (await getDoc(doc(db, 'users', name)))?.data();

    if (user) {
      $projects = JSON.parse(user.projects);
      goal = JSON.parse(user.goal);
    }

    fetched = true;
  }

  /**
  * @param {string} name
  * @param {any} projects
  * @param {number} goal
  */
  async function updateUser(name, projects, goal) {
    if (!fetched) {
      return;
    }

    await setDoc(doc(db, 'users', name), {
      name: name,
      projects: JSON.stringify(projects),
      goal: JSON.stringify(goal),
    }, { merge: true });

    console.log('Updated', name);
  }

  /**
  * @param {string} name
  * @param {any[]} projects
  * @param {number} goal
  */
  function waitUpdateUser(name, projects, goal) {
    clearTimeout(updateDelay);
    updateDelay = setTimeout(() => {
      updateUser(name, projects, goal);
    }, 1000);
  }

  /**
  * @param {string} title
  */
  function titleToString(title) {
    return title.toLowerCase().replace(/\s/g, '-');
  }
</script>

<main>
  {#if $name}
    <h1>Hi, {$name}!</h1>
  {:else}
    <h1>Hello!</h1>
  {/if}
  
  <div class="main-content">
    <div class="chart">
      <Card>
        <h1>Today</h1>
        <PieChart {goal} projects={completedToday} />
      </Card>
    </div>
    
    <Card>
      <div class="sidebar">
        <div>
          <h2>Projects:</h2>
          {#if $projects.length}
            <form name="projects" on:submit={e => { e.preventDefault() }}
              on:input={() => {
                // @ts-ignore
                completedToday = [...(new FormData(document.forms.projects)).entries()]
                  .map(selected => $projects[parseInt(selected[1])]);
              }}>
              <ul>
                {#each $projects as project, i}
                  <li>
                    <input type="checkbox" 
                      name={titleToString(project.title)} 
                      id={titleToString(project.title)}
                      value={i}
                    >
                    <label for={titleToString(project.title)}>{project.title}</label>
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
        <select name="goal" id="goal" bind:value={goal}>
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
      {#if history.length}
        {history}
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
