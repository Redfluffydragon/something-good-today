<script>
  import Modal from './Modal.svelte';
  import { user } from './stores';

  export let open;
</script>

<Modal bind:open title="Options">
  <div class="flex flex-column">
    <label for="celebration">
      Celebration type:
      <select id="celebration" bind:value={$user.celebration}>
        <option value="confetti">Confetti</option>
        <option value="fireworks">Fireworks</option>
        <option value="none">None</option>
      </select>
    </label>

    <section>
      <label for="showStreak"><input type="checkbox" id="showStreak" bind:checked={$user.showStreak} /> Show streak</label>
      <br />
      <label for="showMaxStreak"><input type="checkbox" id="showMaxStreak" bind:checked={$user.showMaxStreak} /> Show max streak</label>
    </section>

    <button
      on:click={() => {
        open = false;
      }}>Done</button
    >
  </div>
</Modal>
