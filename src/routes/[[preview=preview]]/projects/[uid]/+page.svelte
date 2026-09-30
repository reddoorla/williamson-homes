<script lang="ts">
  import ProjectView from "$lib/components/ProjectView.svelte";

  let { data } = $props();
</script>

<ProjectView project={data.project} />
