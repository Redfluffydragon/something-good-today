<script>
  import { page } from '$app/stores';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import InlineWarning from './InlineWarning.svelte';
  import Modal from './Modal.svelte';

  let emailLoginModalOpen = false;
  let wrongPassword = false;
  let wrongEmail = false;

  function loginWithEmail(email, password) {
    signInWithEmailAndPassword($page.data.auth, email, password)
      .then(() => {
        // I don't know why I have to reload so much
        location.reload();
      })
      .catch(error => {
        if (error.code === 'auth/wrong-password') {
          wrongPassword = true;
        } else if (error.code === 'auth/user-not-found') {
          wrongEmail = true;
        }
      });
  }
</script>

<button
  aria-expanded="false"
  on:click={() => {
    emailLoginModalOpen = true;
  }}>Log in with email</button
>

<Modal bind:open={emailLoginModalOpen} title="Log in with email">
  <form
    class="grid"
    on:input={() => {
      wrongPassword = false;
    }}
    on:submit={e => {
      const formData = Object.fromEntries(new FormData(e.target).entries());
      const email = formData.email;
      const password = formData.password;
      if (email && password) {
        e.preventDefault();
        loginWithEmail(email, password);
      }
    }}
  >
    <label for="email">Email: </label>
    <input type="email" name="email" id="email" required />
    <label for="password">Password: </label>
    <input type="password" name="password" id="password" required />
    <div class="warnings">
      <InlineWarning bind:show={wrongPassword}>Password is incorrect</InlineWarning>
      <InlineWarning bind:show={wrongEmail}>No account exists for this email</InlineWarning>
    </div>
    <button>Log in</button>
  </form>
</Modal>

<style>
  form {
    grid-template-columns: 10ch 1fr;
  }

  form button {
    grid-column: span 2;
  }

  .warnings {
    grid-column: span 2;
  }
</style>
