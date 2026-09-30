<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import { pickProjects, projectHref, type ProjectContext } from "$lib/projects";

  let { slice, context }: { slice: Content.ProjectListSlice; context?: ProjectContext } = $props();

  const projects = $derived(
    pickProjects(slice.items, context?.projects ?? [], { fallbackToAll: true }),
  );
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16"
>
  <div class="mx-auto max-w-[940px]">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ul class="mt-8">
      {#each projects as project, i (project.id)}
        <li>
          <a
            href={projectHref(project.uid)}
            class="flex flex-col items-center py-8 md:w-2/3 md:items-end {i % 2 === 1
              ? 'md:ml-auto md:flex-row-reverse'
              : 'md:flex-row'}"
          >
            <div class="relative aspect-square w-full bg-accent md:w-[60%]">
              {#if isFilled.image(project.image)}
                <PrismicImage
                  field={project.image}
                  alt=""
                  class="absolute inset-0 h-full w-full object-cover"
                  imgixParams={{ w: 900 }}
                />
              {/if}
            </div>
            <h3 class="wh-eyebrow px-6 pt-2 text-center">{project.title}</h3>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>
