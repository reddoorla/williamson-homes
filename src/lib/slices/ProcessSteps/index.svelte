<script lang="ts">
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";

  let { slice }: { slice: Content.ProcessStepsSlice } = $props();

  const steps = $derived(slice.items.filter((item) => item.title));
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16"
>
  <div class="mx-auto max-w-[940px]">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    {#if isFilled.richText(slice.primary.intro)}
      <div class="wh-prose mx-auto mt-6 max-w-[600px] text-center text-secondary">
        <RichTextBody field={slice.primary.intro} />
      </div>
    {/if}
    <ol class="wh-steps relative mx-auto mt-16 max-w-[800px] md:border-l-0">
      {#each steps as step, i (i)}
        <li
          class="wh-step relative border-l border-secondary pb-8 pl-10 md:w-1/2 {i % 2 === 0
            ? 'md:ml-auto'
            : 'md:mr-auto md:border-r md:border-l-0 md:pr-10 md:pl-0 md:text-right'}"
        >
          <span
            class="wh-step-number absolute top-0 flex h-9 w-9 items-center justify-center rounded-full border border-secondary bg-white text-secondary md:h-20 md:w-20 md:text-[22px] {i %
              2 ===
            0
              ? '-left-[18px] md:-left-10'
              : '-left-[18px] md:right-[-40px] md:left-auto'}"
            aria-hidden="true">{i + 1}</span
          >
          <h3
            class="wh-h3 pt-1 text-secondary md:pt-5 {i % 2 === 0
              ? 'md:text-left'
              : 'md:text-right'}"
          >
            <span class="sr-only">Step {i + 1}: </span>{step.title}
          </h3>
          {#if isFilled.richText(step.body)}
            <div class="wh-prose mt-2 text-secondary">
              <RichTextBody field={step.body} />
            </div>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</section>
