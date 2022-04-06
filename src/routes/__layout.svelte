<script context="module">
  export async function load() {
    const app = initializeApp(firebaseConfig);
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const db = getFirestore(app);

    return {
      stuff: {
        app: app,
        provider: provider,
        auth: auth,
        db: db,
      },
    };
  }
</script>

<script>
  import { reducedMotion, firebaseConfig, darkMode, user, loggedIn, profile, demoUserData } from '$lib/stores';
  import { onMount } from 'svelte';
  import anime from 'animejs';
  import { GoogleAuthProvider, getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
  import { initializeApp } from 'firebase/app';
  import { page } from '$app/stores';
  import { getFirestore } from 'firebase/firestore';
  import Popup from '$lib/Popup.svelte';
  import { addToHistory, initializeUser, loginWithGoogle, updateUser } from '$lib/user-utils';
  import Modal from '$lib/Modal.svelte';
  import LogInWithEmail from '$lib/LogInWithEmail.svelte';

  // Have to start with something that's a continuous path, like an ellipse, for the morphing to look good
  const moonPath = 'M53.4518 31.5C53.4518 45.031 42.4828 56 28.9518 56C9.45187 55 31.9519 49.5 31.9519 31.5C31.9519 13.5 9.4519 7 28.9518 7C42.4828 7 53.4518 17.969 53.4518 31.5Z';

  const sunPath = 'M49 32C49 41.3888 41.3888 49 32 49C22.6112 49 15 41.3888 15 32C15 22.6112 22.6112 15 32 15C41.3888 15 49 22.6112 49 32Z';

  let startPath = sunPath;
  let startScale = 1;
  let timeline;
  let isAnimationRunning = false;

  let accountPopupOpen = false;
  let optionsModalOpen = false;
  let loginModalOpen = false;

  onMount(() => {
    document.documentElement.toggleAttribute('dark', $darkMode);
    if ($darkMode) {
      startPath = moonPath;
      startScale = 0;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    $reducedMotion = mediaQuery.matches;

    mediaQuery.addEventListener('change', () => {
      $reducedMotion = mediaQuery.matches;
    });

    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden) {
          addToHistory();
        }
      },
      false
    );

    onAuthStateChanged($page.stuff.auth, async newUser => {
      if (newUser) {
        initializeUser($page.stuff.db, newUser);
        addToHistory();
      } else {
        $user = demoUserData;
      }
    });
  });

  function animateIcon() {
    document.documentElement.toggleAttribute('dark');
    $darkMode = !$darkMode;
    localStorage.setItem('darkMode', JSON.stringify($darkMode));

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
        d: [{ value: $darkMode ? moonPath : sunPath }],
        delay: $darkMode ? 700 : 0,
      })
      .add(
        {
          targets: '.sun-ray',
          scale: $darkMode ? 0 : 1,
          delay: anime.stagger(100),
        },
        $darkMode ? 0 : 300
      );
  }

  function logout() {
    // Sync before logout
    updateUser($page.stuff.db, $user);

    console.log('Logged out');
    signOut($page.stuff.auth)
      .then(() => {
        $user = {};
        $loggedIn = false;
        location.reload(); // Maybe not the best solution, but it's the easiest way to get the chart to update
      })
      .catch(error => {
        console.log(error);
      });
    accountPopupOpen = false;
  }
</script>

<button on:click={animateIcon} class="clear-btn">
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
    <title>Switch to {$darkMode ? 'light' : 'dark'} mode</title>
    <path class="sun-ray" style="transform: scale({startScale});" d="M29.2929 6.85715L31.7143 3.59516L34.1357 6.85715H29.2929Z" stroke-width="4.28572" />
    <path class="sun-ray" style="transform: scale({startScale});" d="M53.1003 16.0124L57.136 16.4784L55.5217 20.2063L53.1003 16.0124Z" stroke-width="4.28572" />
    <path class="sun-ray" style="transform: scale({startScale});" d="M56.5217 41.1552L58.1359 44.8832L54.1003 45.3492L56.5217 41.1552Z" stroke-width="4.28572" />
    <path class="sun-ray" style="transform: scale({startScale});" d="M29.2929 57.1428L31.7143 60.4048L34.1357 57.1428H29.2929Z" stroke-width="4.28572" />
    <path class="sun-ray" style="transform: scale({startScale});" d="M7.58491 41.1552L5.97065 44.8832L10.0063 45.3492L7.58491 41.1552Z" stroke-width="4.28572" />
    <path class="sun-ray" style="transform: scale({startScale});" d="M11.0064 16.0124L6.97071 16.4784L8.58498 20.2063L11.0064 16.0124Z" stroke-width="4.28572" />
    <path id="darkModeIcon" d={startPath} stroke-width="5" fill="var(--bg)" />
  </svg>
</button>

<div class="account">
  {#if $loggedIn}
    <button
      on:click={() => {
        accountPopupOpen = !accountPopupOpen;
      }}
      title="Account options"
      class="img-btn"
      id="account-btn"
    >
      {#if $profile.photoURL}
        <img src={$profile.photoURL} alt="" width="64" height="64" />
      {:else}
        {$profile.displayName?.[0] || $profile.email[0]}
      {/if}
    </button>

    <Popup bind:open={accountPopupOpen} button="#account-btn" position="right below">
      <div class="flex flex-column">
        <button
          on:click={() => {
            optionsModalOpen = true;
            accountPopupOpen = false;
          }}>Options</button
        >
        <button on:click={logout}>Log out</button>
      </div>
    </Popup>
  {:else}
    <button
      on:click={() => {
        loginModalOpen = true;
      }}>Log in</button
    >
  {/if}
</div>

<Modal bind:open={loginModalOpen} title="Log In" minWidth="40ch">
  <div class="grid login-wrapper">
    <div class="flex flex-column">
      <button
        on:click={() => {
          loginWithGoogle($page.stuff.auth, $page.stuff.provider, $page.stuff.db);
          loginModalOpen = false;
        }}>Log in with Google</button
      >
      <LogInWithEmail />
    </div>
    <a href="/new-account" sveltekit:prefetch>Create an account</a>
  </div>
</Modal>

<Modal bind:open={optionsModalOpen} title="Options">
  <div class="flex flex-column">
    <label for="celebration">
      Celebration type:
      <select id="celebration" bind:value={$user.celebration}>
        <option value="confetti">Confetti</option>
        <option value="fireworks">Fireworks</option>
        <option value="none">None</option>
      </select>
    </label>
    <button
      on:click={() => {
        optionsModalOpen = false;
      }}>Done</button
    >
  </div>
</Modal>

<div class="spacer" />

<slot />

<footer>
  <h2>Did you do something you feel good about today?</h2>
  <div class="flex">
    <div class="flex links">
      <a href="/">Home</a>
      {#if !$loggedIn}
        <a href="/new-account">Create an account</a>
      {/if}
      <a href="https://github.com/Redfluffydragon/something-good-today">Source code</a>
      <a href="https://github.com/Redfluffydragon/something-good-today/issues/new">Report an issue</a>
    </div>
    <div class="flex links right">
      <a href="/privacy-policy">Privacy Policy</a>
    </div>
  </div>
  <br />
  <p>&copy; 2022 Kai-Shen Deru</p>
</footer>

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

  .account {
    position: absolute;
    right: 1ch;
    top: 1ch;
    width: max-content;
  }

  .img-btn {
    width: 2.25em;
    height: 2.25em;
    font-weight: 600;
  }

  .img-btn,
  .img-btn img {
    border-radius: 50%;
  }

  .img-btn img {
    border: 2.5px solid var(--accent-color);
  }

  .login-wrapper {
    margin: 0 auto;
    width: max-content;
    grid-template-columns: 1fr 1fr;
    justify-items: center;
  }

  footer {
    padding: 2ch;
    background: var(--overlay-bg);
    margin-top: 6em;
    box-shadow: var(--shadow-elevation-high);
    position: sticky;
    top: 100vh;
  }

  footer .flex {
    flex-wrap: wrap;
  }

  footer .links {
    margin-top: 0.5ch;
  }

  footer a {
    color: var(--color);
    font-size: 1.25rem;
  }

  .spacer {
    height: 3em;
  }

  @media (min-width: 570px) {
    footer .right {
      margin-left: auto;
    }
  }
</style>
