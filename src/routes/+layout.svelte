<script>
  import { user, loggedIn, profile, demoUserData } from '$lib/stores';
  import { onMount } from 'svelte';
  import { onAuthStateChanged } from 'firebase/auth';
  import { page } from '$app/stores';
  import {
    enableIndexedDbPersistence,
    disableNetwork,
    enableNetwork,
  } from 'firebase/firestore';
  import Popup from '$lib/Popup.svelte';
  import { addToHistory, initializeUser, loginWithGoogle, logout } from '$lib/user-utils';
  import Modal from '$lib/Modal.svelte';
  import LogInWithEmail from '$lib/LogInWithEmail.svelte';
  import OptionsModal from '$lib/OptionsModal.svelte';
  import LightDarkMode from '$lib/LightDarkMode.svelte';

  let accountPopupOpen = false;
  let optionsModalOpen = false;
  let loginModalOpen = false;

  onMount(() => {
    onAuthStateChanged($page.stuff.auth, async newUser => {
      if (newUser) {
        initializeUser($page.stuff.db, newUser);
      } else {
        $user = demoUserData;
      }
    });

    enableIndexedDbPersistence($page.stuff.db).catch(err => {
      if (err.code == 'failed-precondition') {
        console.log('Offline persistence can only be enabled in one tab at a a time.');
      }
    });

    // prettier-ignore
    addEventListener('offline', () => {
      disableNetwork($page.stuff.db);
    }, false);

    // prettier-ignore
    addEventListener('online', () => {
      enableNetwork($page.stuff.db);
    }, false);

    if ($user.uid) {
      // Check if it's a new day
      addToHistory();
    }
  });
</script>

<LightDarkMode />

<div class="account">
  {#if $loggedIn}
    <button
      aria-expanded={accountPopupOpen}
      title="Account options"
      class="img-btn"
      id="account-btn"
      on:click={() => {
        accountPopupOpen = !accountPopupOpen;
      }}
    >
      {#if $profile.photoURL}
        <img src={$profile.photoURL} alt="" width="64" height="64" />
      {:else}
        {$profile.displayName?.[0] || $profile.email[0]}
      {/if}
    </button>

    <Popup bind:open={accountPopupOpen} button="#account-btn" position="right below">
      <!-- svelte-ignore a11y-no-redundant-roles -->
      <menu role="menu" class="flex flex-column">
        <li>
          <button
            role="menuitem"
            on:click={() => {
              optionsModalOpen = true;
              accountPopupOpen = false;
            }}>Options</button
          >
        </li>
        <li>
          <button
            role="menuitem"
            on:click={() => {
              accountPopupOpen = false;
              logout(user, $page.stuff.auth, $page.stuff.db);
            }}>Log out</button
          >
        </li>
      </menu>
    </Popup>
  {:else}
    <button
      aria-expanded="false"
      on:click={() => {
        loginModalOpen = true;
      }}>Log in</button
    >
  {/if}
</div>

<Modal bind:open={loginModalOpen} title="Log In" minWidth="40ch">
  <div class="flex login-wrapper">
    <div class="flex flex-column">
      <button
        on:click={() => {
          loginWithGoogle($page.stuff.auth, $page.stuff.provider, $page.stuff.db);
          loginModalOpen = false;
        }}>Log in with Google</button
      >
      <LogInWithEmail />
    </div>
    <p>OR</p>
    <a href="/new-account" sveltekit:prefetch>Create an account</a>
  </div>
</Modal>

<OptionsModal bind:open={optionsModalOpen} />

<div class="spacer" />

<slot />

<footer>
  <h2>Did you do something you feel good about today?</h2>
  <p>
    This is a project and daily habit tracker to help you feel like you're not wasting your time.
  </p>
  <nav class="flex">
    <div class="flex links">
      <a href="/">Home</a>
      {#if !$loggedIn}
        <a href="/new-account">Create an account</a>
      {/if}
      <a
        href="https://github.com/Redfluffydragon/something-good-today/issues/new"
        target="_blank"
        rel="noopener">Report an issue</a
      >
    </div>
    <div class="flex links right">
      <a href="/privacy-policy">Privacy Policy</a>
    </div>
  </nav>
  <br />
  <p>&copy; 2022 Kai-Shen Deru</p>
</footer>

<style>
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
    place-content: center;
    place-items: center;
    flex-wrap: wrap;
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

  footer p {
    font-size: 1em;
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
