<script lang="ts">
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";
  import WMark from "$lib/components/WMark.svelte";
  import WhButton from "$lib/components/WhButton.svelte";
  import { buttonsOf } from "$lib/links";

  let { slice }: { slice: Content.StatementSlice } = $props();

  const buttons = $derived(buttonsOf(slice.items));
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16 {slice.primary.ground === 'light' ? 'bg-light' : 'bg-white'}"
>
  <div class="mx-auto max-w-[940px] text-center">
    {#if slice.primary.show_mark}
      <WMark variant="black" class="mb-8 w-16" />
    {/if}
    {#if slice.primary.eyebrow}
      <p class="wh-eyebrow mb-8">{slice.primary.eyebrow}</p>
    {/if}
    {#if isFilled.richText(slice.primary.heading)}
      <div class="wh-statement-heading mx-auto max-w-[620px] text-secondary">
        <RichTextBody field={slice.primary.heading} />
      </div>
    {/if}
    {#if isFilled.richText(slice.primary.body)}
      <div class="wh-prose mx-auto mt-8 max-w-[620px] text-secondary">
        <RichTextBody field={slice.primary.body} />
      </div>
    {/if}
    {#if buttons.length > 0}
      <div class="mt-16 flex justify-center gap-12">
        {#each buttons as button (button.href)}
          <WhButton
            href={button.href}
            tone={button.item.button_tone === "primary" ? "primary" : "secondary"}
            >{button.label}</WhButton
          >
        {/each}
      </div>
    {/if}
  </div>
</section>
