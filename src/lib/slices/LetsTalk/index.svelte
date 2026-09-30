<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import WhButton from "$lib/components/WhButton.svelte";
  import { hrefOf } from "$lib/links";

  let { slice }: { slice: Content.LetsTalkSlice } = $props();

  const href = $derived(hrefOf(slice.primary.button_link));
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4 pb-32"
>
  <div class="relative mx-auto aspect-video max-w-[1280px] overflow-hidden bg-accent">
    {#if isFilled.image(slice.primary.image)}
      <PrismicImage
        field={slice.primary.image}
        alt=""
        class="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
        imgixParams={{ w: 2000 }}
      />
    {/if}
    <div class="relative flex h-full flex-col items-center justify-center p-4 text-center">
      {#if slice.primary.heading}
        <h2 class="wh-h2 text-secondary opacity-75">{slice.primary.heading}</h2>
      {/if}
      {#if href && slice.primary.button_label}
        <WhButton {href} tone="primary" class="mt-8">{slice.primary.button_label}</WhButton>
      {/if}
    </div>
  </div>
</section>
