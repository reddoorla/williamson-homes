<script lang="ts">
  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import WMark from "$lib/components/WMark.svelte";

  let { slice }: { slice: Content.QuoteBannerSlice } = $props();
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="relative overflow-hidden bg-primary px-4 pt-64 pb-96"
>
  {#if isFilled.image(slice.primary.background_image)}
    <PrismicImage
      field={slice.primary.background_image}
      alt=""
      class="absolute inset-0 h-full w-full object-cover"
      imgixParams={{ w: 2400 }}
    />
  {/if}
  <figure class="relative mx-auto max-w-[940px] text-center text-white">
    <WMark class="w-32" />
    <blockquote class="wh-quote mt-16 text-[22px] leading-9">
      <PrismicRichText field={slice.primary.quote} />
    </blockquote>
    {#if slice.primary.attribution}
      <figcaption class="mt-8 uppercase">{slice.primary.attribution}</figcaption>
    {/if}
  </figure>
</section>
