<script lang="ts">
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";
  import WMark from "$lib/components/WMark.svelte";
  import WhButton from "$lib/components/WhButton.svelte";
  import { CONTACT_EMAIL_HREF, CONTACT_PHONE_HREF } from "$lib/contact";
  import type { ProjectDocument } from "../../prismicio-types";

  type Props = { project: ProjectDocument };

  let { project }: Props = $props();

  const gallery = $derived(project.data.gallery.filter((item) => isFilled.image(item.image)));
</script>

<article data-project={project.uid}>
  <section data-wh-hero class="relative flex min-h-[50vh] items-end overflow-hidden bg-primary">
    {#if isFilled.image(project.data.hero_image)}
      <PrismicImage
        field={project.data.hero_image}
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
        imgixParams={{ w: 2400 }}
      />
    {/if}
    <div class="absolute inset-0 bg-black/10"></div>
    <div class="relative mx-auto w-full max-w-[940px] px-4 pt-80 pb-32 text-center">
      <WMark class="h-40" />
      <h1 class="mt-16 px-8 text-[22px] leading-9 font-normal text-white">
        {project.data.title}
      </h1>
      <div class="mt-8 flex justify-center gap-12">
        <WhButton href={CONTACT_EMAIL_HREF}>Email Us</WhButton>
        <WhButton href={CONTACT_PHONE_HREF}>Call Us</WhButton>
      </div>
    </div>
  </section>

  <section
    class="mx-auto max-w-[1280px] px-4 py-32"
    data-wh-header-show="(min-width: 992px), (min-width: 480px) and (max-width: 767px)"
  >
    {#if isFilled.richText(project.data.credits)}
      <div class="wh-credits text-center text-secondary">
        <RichTextBody field={project.data.credits} />
      </div>
    {/if}
    {#if gallery.length > 0}
      <ul class="mt-32 flex flex-col gap-16" aria-label="{project.data.title} gallery">
        {#each gallery as item, i (i)}
          <li>
            <PrismicImage field={item.image} fallbackAlt="" class="block w-full" loading="lazy" />
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</article>
