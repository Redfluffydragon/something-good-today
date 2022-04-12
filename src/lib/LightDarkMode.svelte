<script>
  import anime from 'animejs';
  import { onMount } from 'svelte';
  import { user } from './stores';

  let startPath = sunPath;
  let startScale = 1;
  let timeline;
  let isAnimationRunning = false;
  let darkMode = false;

  // Have to start with something that's a continuous path, like an ellipse, for the morphing to look good
  const moonPath =
    'M53.4518 31.5C53.4518 45.031 42.4828 56 28.9518 56C9.45187 55 31.9519 49.5 31.9519 31.5C31.9519 13.5 9.4519 7 28.9518 7C42.4828 7 53.4518 17.969 53.4518 31.5Z';

  const sunPath =
    'M49 32C49 41.3888 41.3888 49 32 49C22.6112 49 15 41.3888 15 32C15 22.6112 22.6112 15 32 15C41.3888 15 49 22.6112 49 32Z';

  onMount(() => {
    // dark attribute gets set from inline script in app.html
    if (document.documentElement.hasAttribute('dark')) {
      darkMode = true;
      startPath = moonPath;
      startScale = 0;
    }

    user.subscribe(user => {
      // only call updateMode if dark mode changed, not if something else on the user changed
      if (user.darkMode !== darkMode) {
        darkMode = user.darkMode;
        updateMode(darkMode);
      }
    });
  });

  /**
   * Animate the light/dark mode icon between its two states
   */
  function animateIcon(darkMode) {
    if (isAnimationRunning) {
      timeline.reverse();
    }

    timeline = anime.timeline({
      duration: 750,
      easing: 'easeOutElastic',
      begin: () => (isAnimationRunning = true),
      complete: () => (isAnimationRunning = false),
    });

    timeline
      .add({
        targets: '#darkModeIcon',
        d: [{ value: darkMode ? moonPath : sunPath }],
        delay: darkMode ? 700 : 0,
      })
      .add(
        {
          targets: '.sun-ray',
          scale: darkMode ? 0 : 1,
          delay: anime.stagger(100),
        },
        darkMode ? 0 : 300
      );
  }

  /**
   * Update dark/light mode state
   * @param {boolean} darkMode Dark mode or light mode
   */
  function updateMode(darkMode) {
    if (darkMode === undefined) {
      return;
    }

    // Update the icon
    animateIcon(darkMode);

    // Toggle dark for CSS
    document.documentElement.toggleAttribute('dark', darkMode);

    // Save in localStorage for faster loading
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }
</script>

<button
  on:click={() => {
    $user.darkMode = !$user.darkMode;
  }}
  class="clear-btn"
>
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
    <title>Switch to {$user.darkMode ? 'light' : 'dark'} mode</title>
    <path
      class="sun-ray"
      style="transform: scale({startScale});"
      d="M29.2929 6.85715L31.7143 3.59516L34.1357 6.85715H29.2929Z"
      stroke-width="4.28572"
    />
    <path
      class="sun-ray"
      style="transform: scale({startScale});"
      d="M53.1003 16.0124L57.136 16.4784L55.5217 20.2063L53.1003 16.0124Z"
      stroke-width="4.28572"
    />
    <path
      class="sun-ray"
      style="transform: scale({startScale});"
      d="M56.5217 41.1552L58.1359 44.8832L54.1003 45.3492L56.5217 41.1552Z"
      stroke-width="4.28572"
    />
    <path
      class="sun-ray"
      style="transform: scale({startScale});"
      d="M29.2929 57.1428L31.7143 60.4048L34.1357 57.1428H29.2929Z"
      stroke-width="4.28572"
    />
    <path
      class="sun-ray"
      style="transform: scale({startScale});"
      d="M7.58491 41.1552L5.97065 44.8832L10.0063 45.3492L7.58491 41.1552Z"
      stroke-width="4.28572"
    />
    <path
      class="sun-ray"
      style="transform: scale({startScale});"
      d="M11.0064 16.0124L6.97071 16.4784L8.58498 20.2063L11.0064 16.0124Z"
      stroke-width="4.28572"
    />
    <path id="darkModeIcon" d={startPath} stroke-width="5" fill="var(--bg)" />
  </svg>
</button>

<style>
  .clear-btn {
    padding: 1ch;
    position: absolute;
    top: 0;
  }

  path {
    transform-origin: center;
    stroke: var(--color);
  }
</style>
