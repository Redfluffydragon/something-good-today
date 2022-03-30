<script>
  import Card from '$lib/Card.svelte';
  import NewProject from '$lib/NewProject.svelte';
  import EditProjects from '$lib/EditProjects.svelte';
  import PieChart from '$lib/PieChart.svelte';
  import FinishedProjects from '$lib/FinishedProjects.svelte';
  import { loggedIn, shouldUpdate, user } from '$lib/stores';
  import { beforeNavigate } from '$app/navigation';
  import { browser } from '$app/env';
  import { doc, setDoc } from 'firebase/firestore';
  import { page } from '$app/stores';
  import { addToHistory } from '$lib/user-utils';
  import ProjectHistory from '$lib/ProjectHistory.svelte';
  import ProjectsChecklist from '$lib/ProjectsChecklist.svelte';
  import GoalSelect from '$lib/GoalSelect.svelte';

  let updateDelay;

  $: browser && waitUpdateUser($user);

  beforeNavigate(async () => {
    await updateUser($user);
  });

  /**
   * @param {Object} user
   */
  async function updateUser(user) {
    if (!$page.stuff.db || !$loggedIn || !user.uid) {
      return;
    }

    try {
      addToHistory();
      await setDoc(
        doc($page.stuff.db, 'users', user.uid),
        {
          ...user,
          lastUpdated: Date.now(),
        },
        { merge: true }
      );

      console.log('Updated', user.name);
    } catch (err) {
      console.log('Failed to update:', err);
    }
  }

  /**
   * Every time this is called, it further delays updateUser by 5 seconds
   * @param {Object} user
   */
  function waitUpdateUser(user) {
    if (!$shouldUpdate) {
      $shouldUpdate = true;
      return;
    }

    clearTimeout(updateDelay);
    updateDelay = setTimeout(() => {
      updateUser(user);
    }, 5000);
  }
</script>

<svelte:head>
  <title>Something Good</title>
</svelte:head>

<main class="flex flex-column">
  {#if $user.name}
    <h1>Hi, {$user.name}!</h1>
  {:else}
    <div class="spacer" />
  {/if}

  <div class="main-content flex">
    <div class="chart">
      <Card style="height: 100%;">
        <h1>Today</h1>
        <PieChart goal={$user.goal} projects={$user.today} />
      </Card>
    </div>

    <div class="sidebar-wrapper">
      <Card style="height: 100%;">
        <div class="flex flex-column">
          <div>
            <h2>Active Projects:</h2>
            {#if $user.activeProjects?.length}
              <ProjectsChecklist name="main-projects" projects={$user.activeProjects} bind:selected={$user.today} isSelected={id => $user.today?.includes(id)} />
            {:else}
              <p>You don't have any projects.</p>
            {/if}
          </div>
          <NewProject />
          <EditProjects />
          <div>
            <GoalSelect bind:goal={$user.goal} />
          </div>
        </div>
      </Card>
    </div>
  </div>

  <Card>
    <ProjectHistory />
  </Card>

  <Card>
    <FinishedProjects />
  </Card>
</main>

<style>
  main {
    padding: 2ch;
  }

  .main-content {
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

  @media (min-width: 1270px) {
    .spacer {
      height: 2em;
    }
  }
</style>
