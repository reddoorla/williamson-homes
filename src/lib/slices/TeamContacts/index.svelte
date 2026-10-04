<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import { telHref } from "$lib/contact";

  let { slice }: { slice: Content.TeamContactsSlice } = $props();

  const link = "inline-block text-[14px] min-[992px]:text-[16px]";
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="border-l border-transparent px-4 pt-32 pb-32 min-[480px]:border-l-0"
>
  <div class="mx-auto max-w-[568px]">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ul
      class="relative mt-32 min-[480px]:-mx-2.5 min-[480px]:grid min-[480px]:grid-cols-2 min-[480px]:before:absolute min-[480px]:before:inset-y-0 min-[480px]:before:left-1/2 min-[480px]:before:w-px min-[480px]:before:bg-secondary"
    >
      {#each slice.items as person, i (i)}
        {@const left = i % 2 === 0}
        {@const stagger = left && i + 1 < slice.items.length}
        <li
          style:grid-row={Math.floor(i / 2) + 1}
          class="relative min-h-96 border-secondary pt-32 min-[480px]:min-h-64 min-[480px]:border-0 min-[480px]:pt-0 {left
            ? 'border-r text-right min-[480px]:col-start-1 min-[480px]:pr-[129px]'
            : 'mt-32 border-l text-left min-[480px]:col-start-2 min-[480px]:mt-0 min-[480px]:pr-2.5 min-[480px]:pl-[129px]'} {stagger
            ? 'min-[480px]:mt-96'
            : ''}"
        >
          {#if isFilled.image(person.photo)}
            <PrismicImage
              field={person.photo}
              fallbackAlt=""
              class="absolute -top-24 z-10 h-48 w-48 rounded-full object-cover min-[480px]:top-0 {left
                ? 'right-[33px] min-[480px]:right-0 min-[480px]:translate-x-1/2'
                : 'left-[17px] min-[480px]:left-0 min-[480px]:-translate-x-1/2'}"
              imgixParams={{ w: 400, h: 400, fit: "crop" }}
            />
          {/if}
          <div
            class="[overflow-wrap:anywhere] {left
              ? 'pr-[33px] min-[480px]:pr-0'
              : 'pr-2.5 pl-[33px] min-[480px]:pr-0 min-[480px]:pl-0'}"
          >
            <h3 class="wh-h3 text-secondary">
              {person.name}
              {#if person.role}<span class="block">{person.role}</span>{/if}
            </h3>
            <p class="wh-p pt-[1lh] text-secondary">
              {#if person.email}<a href="mailto:{person.email}" class={link}>{person.email}</a><br
                />{/if}
              {#if person.phone}<a href={telHref(person.phone)} class={link}>{person.phone}</a>{/if}
            </p>
          </div>
        </li>
      {/each}
      <span
        class="absolute top-full left-1/2 z-10 hidden h-5 w-5 -translate-x-1/2 rounded-full border border-secondary bg-white min-[480px]:block"
        aria-hidden="true"
      ></span>
    </ul>
  </div>
</section>
