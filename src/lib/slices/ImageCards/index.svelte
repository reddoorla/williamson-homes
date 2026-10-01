<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";
  import WhButton from "$lib/components/WhButton.svelte";
  import { hrefOf } from "$lib/links";

  let { slice }: { slice: Content.ImageCardsSlice } = $props();

  const href = $derived(hrefOf(slice.primary.button_link));
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16"
>
  <div class="mx-auto max-w-[940px] bg-light p-4 py-16 text-center">
    {#if slice.primary.eyebrow}
      <p class="wh-eyebrow text-primary">{slice.primary.eyebrow}</p>
    {/if}
    {#if isFilled.richText(slice.primary.heading)}
      <div class="wh-statement-heading mx-auto mt-8 max-w-[600px] text-secondary">
        <RichTextBody field={slice.primary.heading} />
      </div>
    {/if}
    {#if isFilled.image(slice.primary.logo)}
      <PrismicImage field={slice.primary.logo} fallbackAlt="" class="mx-auto mt-8 w-1/5" />
    {/if}
    <ul class="mt-16 grid gap-8 md:grid-cols-2">
      {#each slice.items as card, i (i)}
        <li>
          <div class="relative aspect-video overflow-hidden bg-accent">
            {#if isFilled.image(card.image)}
              <PrismicImage
                field={card.image}
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
                imgixParams={{ w: 900 }}
              />
            {/if}
          </div>
          {#if card.label}
            <h3 class="wh-eyebrow py-6 text-secondary">{card.label}</h3>
          {/if}
        </li>
      {/each}
    </ul>
    {#if href && slice.primary.button_label}
      <WhButton {href} tone="secondary" single>{slice.primary.button_label}</WhButton>
    {/if}
  </div>
</section>
