<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import { pickProjects, projectHref, type ProjectContext } from "$lib/projects";

  let { slice, context }: { slice: Content.FeaturedProjectsSlice; context?: ProjectContext } =
    $props();

  const projects = $derived(pickProjects(slice.items, context?.projects ?? []));
</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation} class="pt-16">
  <div class="mx-auto max-w-[1280px] px-4">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ul class="mt-16 grid gap-x-5 md:grid-cols-3">
      {#each projects as project (project.id)}
        <li class="max-md:px-2.5">
          <a
            href={projectHref(project.uid)}
            tabindex="-1"
            aria-hidden="true"
            class="wh-featured-photo wh-hover-fade relative block aspect-square overflow-hidden bg-primary hover:bg-[#005a7896]"
          >
            {#if isFilled.image(project.image)}
              <PrismicImage
                field={project.image}
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
                imgixParams={{ w: 900 }}
              />
            {/if}
          </a>
          <h3 class="wh-eyebrow mt-8 pb-6 text-center max-[479px]:text-[15px]">
            <a
              href={projectHref(project.uid)}
              class="wh-hover-fade inline-block [--wh-hover-opacity:.92]">{project.title}</a
            >
          </h3>
        </li>
      {/each}
    </ul>
  </div>
</section>
