<script lang="ts">
  import { PrismicImage, PrismicRichText } from "@prismicio/svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import WMark from "$lib/components/WMark.svelte";
  import WhButton from "$lib/components/WhButton.svelte";
  import { buttonsOf } from "$lib/links";

  let { slice }: { slice: Content.PageHeroSlice } = $props();

  const dark = $derived(slice.primary.text_tone === "dark");
  const groundClass = $derived(
    ({ photo: "bg-primary", primary: "bg-primary", teal: "bg-teal" } as const)[
      slice.primary.background ?? "photo"
    ] ?? "bg-primary",
  );
  const hasPhoto = $derived(
    slice.primary.background !== "teal" &&
      slice.primary.background !== "primary" &&
      isFilled.image(slice.primary.background_image),
  );
  const buttons = $derived(buttonsOf(slice.items));
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="wh-hero relative flex items-end overflow-hidden {slice.primary.ken_burns
    ? 'min-h-[90vh]'
    : 'min-h-[50vh]'} {groundClass}"
>
  {#if hasPhoto}
    <PrismicImage
      field={slice.primary.background_image}
      alt=""
      class="absolute inset-0 h-full w-full object-cover {slice.primary.ken_burns
        ? 'wh-ken-burns'
        : ''}"
      imgixParams={{ w: 2400 }}
    />
  {/if}
  <div class="relative mx-auto w-full max-w-[600px] px-4 pt-48 pb-32 text-center">
    {#if slice.primary.mark !== "none"}
      <WMark variant={slice.primary.mark === "ocean-w" ? "ocean" : "white"} class="h-40" />
    {/if}
    {#if isFilled.richText(slice.primary.heading)}
      <div
        class="wh-hero-heading mx-auto mt-16 max-w-[340px] text-[22px] leading-9 {dark
          ? 'text-primary'
          : 'text-white'}"
      >
        <PrismicRichText field={slice.primary.heading} />
      </div>
    {/if}
    {#if buttons.length > 0}
      <div class="mt-8 flex justify-center gap-12">
        {#each buttons as button, i (i)}
          <WhButton href={button.href} tone={dark ? "primary" : "light"}>{button.label}</WhButton>
        {/each}
      </div>
    {/if}
  </div>
</section>
