<svelte:head>
  <title>Something Good</title>
</svelte:head>

<script>
  import Card from "$lib/Card.svelte";
  import NewProject from "$lib/NewProject.svelte";
  import EditProjects from "$lib/EditProjects.svelte";
  import PieChart from "$lib/PieChart.svelte";
  import FinishedProjects from "$lib/FinishedProjects.svelte";
  import Project from "$lib/Project.svelte";
  import { loggedIn, user } from "$lib/stores";
  import { beforeNavigate } from "$app/navigation";
  import { browser } from "$app/env";
  import { doc, setDoc } from 'firebase/firestore';
  import { page } from "$app/stores";
  import { addToHistory } from "$lib/user-utils";
  import ProjectHistory from "$lib/ProjectHistory.svelte";

  let updateDelay;
  let firstLoad = true;

  $: browser && waitUpdateUser($user);

  beforeNavigate(async () => {
    await updateUser($user);
  });

  /**
   * @param {Object} user
  */
  async function updateUser(user) {
    if (!$page.stuff.db || !$loggedIn) {
      return;
    }

    try {
      addToHistory();
      await setDoc(doc($page.stuff.db, 'users', user.uid), {
        ...user,
        lastUpdated: Date.now(),
      }, { merge: true });

      console.log('Updated', user.name);
    } catch (err) {
      console.log('Failed to update:', err);
    }
  }

  /**
   * Every time this is called, it further delays updateUser by 2 seconds
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
    }, 2000);
  }

  /**
   * @param {string} title
  */
  function titleToId(title) {
    return title.toLowerCase().replace(/\s/g, '-');
  }
</script>

<main>
  {#if $user?.name}
    <h1>Hi, {$user.name}!</h1>
  {:else}
    <h1>Hello!</h1>
  {/if}
  
  <div class="main-content">
    <div class="chart">
      <Card style="height: 100%;">
        <h1>Today</h1>
        <PieChart goal={$user.goal} projects={$user.today} />
      </Card>
    </div>

    <div class="sidebar-wrapper">
      <Card style="height: 100%;">
        <div class="sidebar">
          <div>
            <h2>Active Projects:</h2>
            {#if $user.activeProjects?.length}
              <form name="projects" on:submit={e => { e.preventDefault() }}
                on:input={() => {
                  $user.today = [...(new FormData(document.forms.projects)).entries()]
                    .map(selected => parseInt(selected[1]));
                }}>
                <ul>
                  {#each $user.activeProjects as id(id)}
                    <li>
                      <input type="checkbox"
                        name={titleToId($user.projects[id].title)}
                        id={titleToId($user.projects[id].title)}
                        value={id}
                        checked={$user.today?.includes(id)}
                      >
                      <label for={titleToId($user.projects[id].title)}>
                        <Project color={$user.projects[id].color}>{$user.projects[id].title}</Project>
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
          <div>
            <label for="goal">
              <h2>Goal:</h2>
            </label>
            <select name="goal" id="goal" bind:value={$user.goal}>
              <option value="1" selected>One project every day</option>
              <option value="2">Two projects every day</option>
              <option value="3">Three projects every day</option>
              <option value="4">Four projects every day</option>
              <option value="5">Five projects every day</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  </div>

  <div class="history">
    <ProjectHistory />
  </div>

  <Card>
    <FinishedProjects />
  </Card>
</main>

<style>
  main {
    padding: 2ch;
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
