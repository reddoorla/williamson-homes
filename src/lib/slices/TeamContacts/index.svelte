<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import { telHref } from "$lib/contact";

  let { slice }: { slice: Content.TeamContactsSlice } = $props();
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 py-32"
>
  <div class="mx-auto max-w-[600px]">
    {#if slice.primary.heading}
      <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
    {/if}
    <ul class="mt-32 grid gap-16 md:grid-cols-2">
      {#each slice.items as person, i (i)}
        <li
          class="flex flex-col items-center gap-4 {i % 2 === 0
            ? 'md:items-end md:text-right'
            : 'md:items-start md:text-left'}"
        >
          {#if isFilled.image(person.photo)}
            <PrismicImage
              field={person.photo}
              fallbackAlt=""
              class="h-48 w-48 rounded-full object-cover"
              imgixParams={{ w: 400, h: 400, fit: "crop" }}
            />
          {/if}
          <h3 class="wh-h3 text-secondary">
            {person.name}
            {#if person.role}<span class="block">{person.role}</span>{/if}
          </h3>
          <p class="wh-p text-secondary">
            {#if person.email}<a href="mailto:{person.email}" class="block">{person.email}</a>{/if}
            {#if person.phone}<a href={telHref(person.phone)} class="block">{person.phone}</a>{/if}
          </p>
        </li>
      {/each}
    </ul>
  </div>
</section>
