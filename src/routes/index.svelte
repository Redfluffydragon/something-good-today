<script>
  import Card from '$lib/Card.svelte';
  import NewProject from '$lib/NewProject.svelte';
  import EditProjects from '$lib/EditProjects.svelte';
  import PieChart from '$lib/PieChart.svelte';
  import FinishedProjects from '$lib/FinishedProjects.svelte';
  import { loggedIn, profile, shouldUpdate, user } from '$lib/stores';
  import { beforeNavigate } from '$app/navigation';
  import { browser } from '$app/env';
  import { page } from '$app/stores';
  import { updateUser } from '$lib/user-utils';
  import ProjectHistory from '$lib/ProjectHistory.svelte';
  import ProjectsChecklist from '$lib/ProjectsChecklist.svelte';
  import GoalSelect from '$lib/GoalSelect.svelte';
  import Celebrate from '$lib/Celebrate.svelte';

  let updateTimeout;
  let waitingToUpdate = false;
  let playCelebrate = false;

  $: browser && waitToUpdateUser($user);

  beforeNavigate(() => {
    if (waitingToUpdate) {
      const userBlob = new Blob([JSON.stringify($user)], { type: 'application/json' });
      navigator.sendBeacon('/sync', userBlob);
    }
  });

  /**
   * @param {Object} user
   */
  async function safeUpdateUser(user) {
    if (!$page.stuff.db || !$loggedIn || !user.uid) {
      return;
    }

    try {
      await updateUser($page.stuff.db, user);
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
      safeUpdateUser(user);
    }, 3000);

    waitingToUpdate = true;
  }

  function celebrate(e) {
    if ($user.today.length >= parseInt($user.goal) && e.detail.oldSize <= $user.today.length) {
      playCelebrate = true;
    }
  }
</script>

<svelte:head>
  <title>Something Good Today</title>
  <meta property="og:title" content="Something Good Today" />

  <meta name="description" content="A tool to help motivate you and keep you on track for long-term projects or daily habits. Did you do something you feel good about today?" />
  <meta property="og:description" content="A tool to help motivate you and keep you on track for long-term projects or daily habits. Did you do something you feel good about today?" />
</svelte:head>

<main class="flex flex-column">
  <div class="main-content flex">
    <div class="chart">
      <Card style="height: 100%;">
        <h1>Today</h1>
        <div class="relative">
          <Celebrate bind:play={playCelebrate} bind:type={$user.celebration} />
          <PieChart goal={$user.goal} projects={$user.today} />
        </div>
      </Card>
    </div>

    <div class="sidebar-wrapper">
      <Card style="height: 100%;">
        <div class="flex flex-column">
          <div>
            <h2>Active Projects:</h2>
            {#if $user.activeProjects?.length}
              <ProjectsChecklist name="main-projects" projects={$user.activeProjects} bind:selected={$user.today} isSelected={id => $user.today?.includes(id)} on:input={celebrate} />
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
