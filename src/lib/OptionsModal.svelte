<script>
  import Modal from './Modal.svelte';
  import { user } from './stores';

  export let open;
</script>

<Modal bind:open title="Options">
  <div class="flex flex-column">
    <label for="celebration">
      Celebration type:
      <select id="celebration" bind:value={$user.options.celebration}>
        <option value="confetti">Confetti</option>
        <option value="fireworks">Fireworks</option>
        <option value="none">None</option>
      </select>
    </label>

    <section>
      <label for="showStreak"
        ><input type="checkbox" id="showStreak" bind:checked={$user.options.showStreak} /> Show streak</label
      >
      <br />
      <label for="showMaxStreak"
        ><input type="checkbox" id="showMaxStreak" bind:checked={$user.options.showMaxStreak} /> Show
        max streak</label
      >
    </section>

    <label for="filterColor">
      {$user.options.colorFilter !== 1
        ? `Make colors ${Math.abs(Math.round(($user.options.colorFilter - 1) * 100))}% ${
            $user.options.colorFilter > 1
              ? 'more vibrant on light mode'
              : 'less vibrant on dark mode'
          }`
        : `Don't filter colors`}
    </label>
    <input
      type="range"
      id="filterColor"
      min="0"
      max="2"
      step="0.05"
      bind:value={$user.options.colorFilter}
    />

    <button
      on:click={() => {
        open = false;
      }}>Done</button
    >
  </div>
</Modal>
