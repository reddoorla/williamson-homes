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
      {#each links as link, i (link.anchor)}
        <li>
          <a href="#{link.anchor}" class="group flex flex-col items-center gap-2">
            <span
              class="flex h-20 w-20 items-center justify-center rounded-full border border-secondary bg-secondary text-[22px] text-white transition-colors group-hover:bg-white group-hover:text-secondary"
              aria-hidden="true">{i + 1}</span
            >
            <span class="wh-eyebrow p-2">{link.label}</span>
          </a>
        </li>
      {/each}
    </ol>
  </div>
</section>
