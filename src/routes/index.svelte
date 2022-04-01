<script>
  import Card from '$lib/Card.svelte';
  import NewProject from '$lib/NewProject.svelte';
  import EditProjects from '$lib/EditProjects.svelte';
  import PieChart from '$lib/PieChart.svelte';
  import FinishedProjects from '$lib/FinishedProjects.svelte';
  import { loggedIn, profile, shouldUpdate, user } from '$lib/stores';
  import { beforeNavigate } from '$app/navigation';
  import { browser } from '$app/env';
  import { doc, setDoc } from 'firebase/firestore';
  import { page } from '$app/stores';
  import { addToHistory } from '$lib/user-utils';
  import ProjectHistory from '$lib/ProjectHistory.svelte';
  import ProjectsChecklist from '$lib/ProjectsChecklist.svelte';
  import GoalSelect from '$lib/GoalSelect.svelte';

  let updateTimeout;
  let waitingToUpdate = false;

  $: browser && waitToUpdateUser($user);

  beforeNavigate(() => {
    if (waitingToUpdate) {
      const blob = new Blob([JSON.stringify($user)], { type: 'application/json' });
      navigator.sendBeacon('/sync', blob);
    }
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

      console.log('Updated', $profile.displayName);
    } catch (err) {
      console.log('Failed to update:', err);
    } finally {
      waitingToUpdate = false;
    }
  }

  /**
   * Every time this is called, it further delays updateUser by 3 seconds
   * @param {Object} user
   */
  function waitToUpdateUser(user) {
    if (!$shouldUpdate) {
      $shouldUpdate = true;
      return;
    }

    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateUser(user);
    }, 3000);

    waitingToUpdate = true;
  }
</script>

<svelte:head>
  <title>Something Good</title>
</svelte:head>

<main class="flex flex-column">
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
</style>
