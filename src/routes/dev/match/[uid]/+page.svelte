<script lang="ts">
  import { SliceZone } from "@prismicio/svelte";
  import ProjectView from "$lib/components/ProjectView.svelte";
  import { components } from "$lib/slices";

  let { data } = $props();
</script>

{#if data.project}
  <ProjectView project={data.project} />
{:else}
  <SliceZone slices={data.slices as never} {components} context={{ projects: data.projects }} />
{/if}
