<script>
  import Card from '$lib/Card.svelte';
  import NewProject from '$lib/NewProject.svelte';
  import EditProjects from '$lib/EditProjects.svelte';
  import PieChart from '$lib/PieChart.svelte';
  import FinishedProjects from '$lib/FinishedProjects.svelte';
  import { loggedIn, shouldUpdate, user } from '$lib/stores';
  import { beforeNavigate } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { addToHistory, pushUser } from '$lib/user-utils';
  import ProjectHistory from '$lib/ProjectHistory.svelte';
  import ProjectsChecklist from '$lib/ProjectsChecklist.svelte';
  import GoalSelect from '$lib/GoalSelect.svelte';
  import Celebrate from '$lib/Celebrate.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { doc, getDoc } from 'firebase/firestore';

  let updateTimeout;
  let waitingToUpdate = false;
  let playCelebrate = false;

  user.subscribe(user => {
    if (!browser) return;

    waitToUpdateUser(user);
  });

  beforeNavigate(() => {
    if (waitingToUpdate) {
      navigator.sendBeacon(
        '/sync',
        new Blob([JSON.stringify($user)], { type: 'application/json' })
      );
    }
  });

  onMount(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange, false);
  });

  onDestroy(() => {
    if (!browser) return;
    document.removeEventListener('visibilitychange', handleVisibilityChange, false);
  });

  /**
   * Sync and add to history and such as needed on page visiblity changes
   */
  async function handleVisibilityChange() {
    if (!document.hidden) {
      $shouldUpdate = false;
      // Pull when unhidden - mostly for mobile
      $user = (await getDoc(doc($page.data.db, 'users', $user.uid)))?.data();

      // Check if it's a new day
      addToHistory();
    } else if (document.hidden && waitingToUpdate) {
      // Sync on page hidden - also mostly for mobile
      clearTimeout(updateTimeout);
      safeUpdateUser($user);
    }
  }

  /**
   * Safely try to push user data to Firestore
   * @param {Object} user
   */
  async function safeUpdateUser(user) {
    if (!canUpdate(user)) {
      return;
    }

    try {
      await pushUser($page.data.db, user);
    } catch (err) {
      console.log('Failed to update:', err);
    } finally {
      waitingToUpdate = false;
    }
  }

  /**
   * Every time this is called, it further delays safeUpdateUser by 3 seconds
   * @param {Object} user
   */
  function waitToUpdateUser(user) {
    // Check here too so it doesn't update on first page load
    if (!canUpdate(user)) {
      return;
    }

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

  /**
   * Check if it's possible to update the user (db exists, is logged in, and the user exists)
   * @param {Object} user The user to check if it exists
   * @returns {boolean} True if it's possible to update the user, and false otherwise
   */
  function canUpdate(user) {
    return !(!$page.data.db || !$loggedIn || !user.uid);
  }

  /**
   * Celebrate when the user acheives their goal or goes beyond it
   * @param {any} e A custom input event
   */
  function celebrate(e) {
    if ($user.today.length >= parseInt($user.goal) && e.detail.oldSize <= $user.today.length) {
      playCelebrate = true;
    }
  }
</script>

<svelte:head>
  <title>Something Good Today</title>
  <meta property="og:title" content="Something Good Today" />

  <meta
    name="description"
    content="A tool to help motivate you and keep you on track for long-term projects or daily habits. Did you do something you feel good about today?"
  />
  <meta
    property="og:description"
    content="A tool to help motivate you and keep you on track for long-term projects or daily habits. Did you do something you feel good about today?"
  />
</svelte:head>

<main class="flex flex-column">
  <div class="main-content flex">
    <section aria-labelledby="today-header" class="chart">
      <Card style="height: 100%;">
        <h1 id="today-header">Today</h1>
        <div class="relative">
          <Celebrate bind:play={playCelebrate} bind:type={$user.options.celebration} />
          <PieChart
            goal={$user.goal}
            projects={$user.today}
            noneMessage="Nothing yet today."
            dumbUpdateLimit="3"
          />
        </div>
      </Card>
    </section>

    <div class="sidebar-wrapper">
      <Card style="height: 100%;">
        <div class="flex flex-column full-height">
          <section class="projects-list" aria-labelledby="main-projects-header">
            <h2 id="main-projects-header">Active Projects</h2>
            {#if $user.activeProjects?.length}
              <ProjectsChecklist
                name="main-projects"
                projects={$user.activeProjects}
                bind:selected={$user.today}
                isSelected={id => $user.today?.includes(id)}
                on:input={celebrate}
              />
            {:else}
              <p>You don't have any projects.</p>
            {/if}
          </section>
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

  .sidebar-wrapper,
  .projects-list {
    flex: 1;
  }
</style>
