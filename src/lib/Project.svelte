<script>
  import { user } from './stores';

  export let id;
</script>

<span style="text-decoration-color: {$user.projects[id].color};">{$user.projects[id].title}</span>

<style>
  span {
    text-decoration: underline;
  }
</style>
