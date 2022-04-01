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
  import { reducedMotion, firebaseConfig, darkMode, user, loggedIn, profile, demoUserData, shouldUpdate } from '$lib/stores';
  import { onMount } from 'svelte';
  import anime from 'animejs';
  import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
  import { initializeApp } from 'firebase/app';
  import { page } from '$app/stores';
  import { getFirestore, getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
  import Popup from '$lib/Popup.svelte';
  import { addToHistory } from '$lib/user-utils';

  // Have to start with something that's a continuous path, like an ellipse, for the morphing to look good
  const moonPath = 'M53.4518 31.5C53.4518 45.031 42.4828 56 28.9518 56C9.45187 55 31.9519 49.5 31.9519 31.5C31.9519 13.5 9.4519 7 28.9518 7C42.4828 7 53.4518 17.969 53.4518 31.5Z';

  const sunPath = 'M49 32C49 41.3888 41.3888 49 32 49C22.6112 49 15 41.3888 15 32C15 22.6112 22.6112 15 32 15C41.3888 15 49 22.6112 49 32Z';

  let startPath = sunPath;
  let startScale = 1;
  let timeline;
  let isAnimationRunning = false;

  let accountPopupOpen = false;

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
        initializeUser(newUser);
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

  async function initializeUser(newUser) {
    $shouldUpdate = false;
    $user = (await getDoc(doc($page.stuff.db, 'users', newUser.uid)))?.data();
    $profile = newUser;
    $loggedIn = true;

    if (!$user) {
      const defaultUserData = {
        goal: '1',
        name: newUser.displayName,
        nextId: 0,
        projects: {},
        activeProjects: [],
        finishedProjects: [],
        deletedProjects: [],
        today: [],
        history: [],
        lastUpdated: Date.now(),
        uid: newUser.uid,
      };

      await setDoc(doc($page.stuff.db, 'users', newUser.uid), defaultUserData, {
        merge: true,
      });
      $shouldUpdate = false;
      $user = (await getDoc(doc($page.stuff.db, 'users', newUser.uid)))?.data();
    }

    onSnapshot(doc($page.stuff.db, 'users', newUser.uid), doc => {
      // Only update local data if the write is completed
      if (!doc.metadata.hasPendingWrites) {
        $shouldUpdate = false;
        $user = doc.data();
      }
    });
  }

  function loginWithGoogle() {
    signInWithPopup($page.stuff.auth, $page.stuff.provider)
      .then(async result => {
        // The signed-in user info.
        const newUser = result.user;

        initializeUser(newUser);
      })
      .catch(error => {
        console.log(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

  function logout() {
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
        {$user.name[0]}
      {/if}
    </button>

    <Popup bind:open={accountPopupOpen} button="#account-btn" position="right below">
      <div class="flex flex-column">
        <button on:click={logout} class="login-btn">Log out</button>
      </div>
    </Popup>
  {:else}
    <button on:click={loginWithGoogle} class="login-btn">Log in</button>
  {/if}
</div>

<div class="spacer" />

<slot />

<footer>
  <h2>Did you do something you feel good about today?</h2>
  <p>&copy; 2022 Kai-Shen Deru</p>
</footer>

<style>
  .clear-btn {
    padding: 1ch;
    position: absolute;
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
    border: 3px solid var(--accent-color);
  }

  footer {
    padding: 2ch;
    background: var(--overlay-bg);
    margin-top: 6em;
    box-shadow: var(--shadow-elevation-high);
    position: sticky;
    top: 100vh;
  }

  .spacer {
    height: 3em;
  }
</style>
