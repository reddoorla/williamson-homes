<script lang="ts">
  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";

  let { slice }: { slice: Content.TimelineSlice } = $props();
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-16"
>
  <div class="mx-auto max-w-[940px]">
    {#if slice.primary.heading}
      <h2 class="wh-eyebrow text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ol class="mx-auto mt-16 max-w-[800px]">
      {#each slice.items as entry, i (i)}
        <li
          class="relative border-l border-secondary pb-16 pl-10 md:w-1/2 {i % 2 === 1
            ? 'md:ml-auto'
            : 'md:mr-auto md:border-r md:border-l-0 md:pr-10 md:pl-0 md:text-right'}"
        >
          <span
            class="absolute top-2 h-5 w-5 rounded-full border border-secondary bg-white {i % 2 === 1
              ? '-left-2.5'
              : '-left-2.5 md:right-[-10px] md:left-auto'}"
            aria-hidden="true"
          ></span>
          <div class="wh-h3 text-secondary">
            <PrismicRichText field={entry.name} />
          </div>
          {#if entry.body}
            <p class="wh-p mt-2 text-secondary">{entry.body}</p>
          {/if}
          {#if isFilled.image(entry.image)}
            <figure class="mt-4">
              <PrismicImage
                field={entry.image}
                fallbackAlt=""
                class="inline-block max-w-full"
                loading="lazy"
              />
              {#if entry.caption}
                <figcaption class="wh-p mt-2 text-secondary">{entry.caption}</figcaption>
              {/if}
            </figure>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</section>
