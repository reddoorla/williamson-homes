<script lang="ts">
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";

  let { slice }: { slice: Content.AnchorIntroSlice } = $props();

  const links = $derived(slice.items.filter((item) => item.label && item.anchor));
</script>

<section
  id="about-us"
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16"
>
  <div class="mx-auto max-w-[940px] text-center">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-primary">{slice.primary.heading}</h2>
    {/if}
    {#if isFilled.richText(slice.primary.body)}
      <div class="wh-prose mx-auto mt-8 max-w-[600px] text-secondary">
        <RichTextBody field={slice.primary.body} />
      </div>
    {/if}
    <ol class="mt-16 grid gap-8 md:grid-cols-3">
      {#each links as link, i (i)}
        <li>
          <a
            href="#{link.anchor}"
            class="wh-anchor-circle group wh-hover-fade flex flex-col items-center gap-2 [--wh-hover-opacity:1]"
          >
            <span
              class="wh-h3 flex h-20 w-20 items-center justify-center rounded-full border border-secondary bg-transparent text-secondary [transition:background-color_.7s_ease-in-out,color_.2s_cubic-bezier(.215,.61,.355,1)] group-hover:bg-secondary group-hover:text-white"
              aria-hidden="true">{i + 1}</span
            >
            <span class="wh-eyebrow p-2">{link.label}</span>
          </a>
        </li>
      {/each}
    </ol>
  </div>
</section>
