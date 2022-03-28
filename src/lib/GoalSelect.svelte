<script>
  export let goal = 1;
</script>

<label for="goal">
  <h2>Goal:</h2>
</label>
<select name="goal" id="goal" bind:value={goal}>
  <option value="1" selected>One project every day</option>
  <option value="2">Two projects every day</option>
  <option value="3">Three projects every day</option>
  <option value="4">Four projects every day</option>
  <option value="5">Five projects every day</option>
</select>
