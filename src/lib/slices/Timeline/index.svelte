<script lang="ts">
  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";

  let { slice }: { slice: Content.TimelineSlice } = $props();

  const last = $derived(slice.items.length - 1);
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
>
  <div
    class="mx-auto max-w-[980px] border-l border-transparent px-4 pt-16 min-[480px]:border-l-0 min-[480px]:pb-32"
  >
    {#if slice.primary.heading}
      <h2 class="wh-timeline-heading">{slice.primary.heading}</h2>
    {/if}
    <div
      class="relative mt-16 border-l border-transparent px-4 min-[480px]:mt-24 min-[480px]:border-l-0 min-[480px]:px-0"
    >
      <ol class="wh-timeline">
        {#each slice.items as entry, i (i)}
          {@const left = i % 2 === 0}
          <li
            class="wh-timeline-entry relative border-l px-4 min-[480px]:grid min-[480px]:grid-cols-2 min-[480px]:border-l-0 min-[480px]:px-0 {i ===
            last
              ? 'border-transparent min-[480px]:min-h-64'
              : 'border-secondary min-[480px]:min-h-128'}"
          >
            <span
              class="absolute top-0 -left-[19px] h-9 w-9 rounded-full border border-secondary bg-white min-[480px]:left-1/2 min-[480px]:z-10 min-[480px]:h-5 min-[480px]:w-5 min-[480px]:-translate-x-1/2"
              aria-hidden="true"
            ></span>
            <div
              class="min-[480px]:row-start-1 min-[480px]:border-secondary {left
                ? 'min-[480px]:col-start-1 min-[480px]:border-r min-[480px]:pr-8 min-[480px]:text-right'
                : 'min-[480px]:col-start-2 min-[480px]:border-l min-[480px]:pl-8'}"
            >
              <div class="wh-h3 pl-4 text-secondary min-[480px]:pl-0">
                <PrismicRichText field={entry.name} />
              </div>
              {#if entry.body}
                <p
                  class="wh-p mb-2.5 pt-2 pl-4 text-secondary min-[480px]:mb-0 min-[480px]:pt-[1lh] min-[480px]:pl-0"
                >
                  {entry.body}
                </p>
              {/if}
            </div>
            {#if isFilled.image(entry.image)}
              <figure
                class="pl-4 min-[480px]:row-start-1 min-[480px]:border-secondary {left
                  ? 'min-[480px]:col-start-2 min-[480px]:border-l min-[480px]:pl-8'
                  : 'min-[480px]:col-start-1 min-[480px]:border-r min-[480px]:pr-8 min-[480px]:pl-0 min-[480px]:text-right'}"
              >
                <PrismicImage
                  field={entry.image}
                  fallbackAlt=""
                  class="block h-auto max-w-full {left ? '' : 'min-[480px]:ml-auto'} {i === 0
                    ? '-mt-[9px]'
                    : ''}"
                  style="width: {entry.image.dimensions.width}px"
                  loading="lazy"
                />
                {#if entry.caption}
                  <figcaption class="wh-p pb-8 text-secondary min-[480px]:pb-0">
                    {entry.caption}
                  </figcaption>
                {/if}
              </figure>
            {/if}
          </li>
        {/each}
      </ol>
      <span
        class="absolute top-full left-1/2 z-10 hidden h-5 w-5 -translate-x-1/2 rounded-full border border-secondary bg-white min-[480px]:block"
        aria-hidden="true"
      ></span>
    </div>
  </div>
</section>

<style>
  .wh-timeline-heading {
    color: var(--color-primary);
    text-align: center;
    font-size: 16px;
    line-height: 36px;
    font-weight: 300;
  }

  @media (min-width: 480px) {
    .wh-timeline-heading {
      font-size: 15px;
      line-height: 24px;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
  }
</style>
