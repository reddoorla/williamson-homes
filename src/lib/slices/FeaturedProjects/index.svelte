<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import { pickProjects, projectHref, type ProjectContext } from "$lib/projects";

  let { slice, context }: { slice: Content.FeaturedProjectsSlice; context?: ProjectContext } =
    $props();

  const projects = $derived(pickProjects(slice.items, context?.projects ?? []));
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16"
>
  <div class="mx-auto max-w-[1280px]">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ul class="mt-16 grid gap-8 md:grid-cols-3">
      {#each projects as project (project.id)}
        <li>
          <a href={projectHref(project.uid)} class="group block">
            <div class="relative aspect-square overflow-hidden bg-primary">
              {#if isFilled.image(project.image)}
                <PrismicImage
                  field={project.image}
                  alt=""
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  imgixParams={{ w: 900 }}
                />
              {/if}
            </div>
            <h3 class="wh-eyebrow mt-8 pb-6 text-center opacity-75">{project.title}</h3>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>
