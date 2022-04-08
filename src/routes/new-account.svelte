<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Card from '$lib/Card.svelte';
  import InlineWarning from '$lib/InlineWarning.svelte';
  import { titleSuffix } from '$lib/stores';
  import { initializeUser, loginWithGoogle } from '$lib/user-utils';
  import { createUserWithEmailAndPassword } from 'firebase/auth';

  let passwordsDontMatch = false;
  let passwordTooShort = false;
  let emailAlreadyUsed = false;

  function hasEmptyFields(formData) {
    return Object.keys(formData).length < 3;
  }

  function validatePasswords(formData) {
    passwordsDontMatch = formData.password !== formData['confirm-password'];
    passwordTooShort = formData.password.length < 6;

    return !passwordsDontMatch && !passwordTooShort;
  }

  async function submit(e) {
    const formData = Object.fromEntries(new FormData(e.target).entries());
    if (!hasEmptyFields(formData)) {
      e.preventDefault();

      if (validatePasswords(formData)) {
        createUserWithEmailAndPassword($page.stuff.auth, formData.email, formData.password)
          .then(async userCredential => {
            initializeUser($page.stuff.db, userCredential.user);

            // redirect to homepage
            goto('/');
          })
          .catch(err => {
            if (err.code === 'auth/email-already-in-use') {
              emailAlreadyUsed = true;
            }
          });
      }
    }
  }
</script>

<svelte:head>
  <title>Create an account {titleSuffix}</title>
</svelte:head>

<main class="flex">
  <Card>
    <h1>Create an account</h1>
    <p>To save your projects and history and sync across devices.</p>
    <br />
    <br />
    <div class="flex flex-column main-column">
      <form
        action=""
        on:submit={submit}
        on:input={() => {
          passwordsDontMatch = false;
          passwordTooShort = false;
          emailAlreadyUsed = false;
        }}
        class="grid"
      >
        <label for="email">Email:</label>
        <input type="email" name="email" id="email" required />
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required />
        <label for="confirm-password">Confirm password:</label>
        <input type="password" name="confirm-password" id="confirm-password" required />
        <div class="warnings flex flex-column">
          <InlineWarning bind:show={passwordsDontMatch}>Passwords must match</InlineWarning>
          <InlineWarning bind:show={passwordTooShort}>Password must be at least 6 characters</InlineWarning>
          <InlineWarning bind:show={emailAlreadyUsed}>Email already in use. Try signing in.</InlineWarning>
        </div>
        <button>Create account</button>
      </form>
      <p>OR</p>
      <button
        on:click={() => {
          loginWithGoogle($page.stuff.auth, $page.stuff.provider, $page.stuff.db);
        }}>Create an account with Google</button
      >
      <br />
    </div>
  </Card>
</main>

<style>
  main {
    justify-content: center;
  }

  form {
    max-width: 50ch;
    margin: 0 auto;
    grid-template-columns: 1fr 1fr;
  }

  p {
    text-align: center;
  }

  form button,
  .warnings {
    grid-column: span 2;
  }

  .main-column {
    align-items: center;
  }
</style>
