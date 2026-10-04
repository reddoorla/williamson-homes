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
  class="border-l border-transparent px-4 pt-16 min-[480px]:border-l-0"
>
  <div class="mx-auto max-w-[948px]">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ul class="mt-16">
      {#each projects as project, i (project.id)}
        <li>
          <a
            href={projectHref(project.uid)}
            class="flex w-full flex-col items-center py-8 min-[480px]:items-stretch {i % 2 === 0
              ? 'min-[480px]:flex-row-reverse'
              : 'min-[480px]:flex-row'}"
          >
            <div class="relative aspect-square w-full bg-accent min-[480px]:w-[60%]">
              {#if isFilled.image(project.image)}
                <PrismicImage
                  field={project.image}
                  alt=""
                  class="absolute inset-0 h-full w-full object-cover object-bottom"
                  imgixParams={{ w: 900 }}
                />
              {/if}
            </div>
            <h3 class="wh-eyebrow px-6 pt-2 text-center min-[480px]:self-end min-[480px]:text-left">
              {project.title}
            </h3>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>
