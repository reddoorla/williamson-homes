<script lang="ts">
  import { onMount } from "svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";

  let { slice }: { slice: Content.ProcessStepsSlice } = $props();

  const steps = $derived(slice.items.filter((item) => item.title));

  let revealing = $state(false);
  let reached = $state(0);
  let stepEls: HTMLLIElement[] = $state([]);

  const isActive = (i: number) => !revealing || i < reached;

  onMount(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;
    revealing = true;
    reached = 1;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stepEls.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) reached = Math.max(reached, index + 1);
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    for (const el of stepEls) if (el) observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="px-4"
>
  <div class="mx-auto max-w-[940px]">
    <div class="pt-16 md:pt-32">
      {#if slice.primary.heading}
        <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
      {/if}
      {#if isFilled.richText(slice.primary.intro)}
        <div class="wh-prose mx-auto mt-6 max-w-[600px] text-center text-secondary">
          <RichTextBody field={slice.primary.intro} />
        </div>
      {/if}
    </div>
    <ol class="wh-steps relative mx-auto mt-16 max-w-[800px] md:mt-24">
      {#each steps as step, i (i)}
        <li
          bind:this={stepEls[i]}
          data-active={isActive(i) ? "" : undefined}
          class="wh-step relative border-l border-secondary pb-8 pl-10 md:min-h-[15rem] md:w-1/2 {i %
            2 ===
          0
            ? 'md:ml-auto'
            : 'md:mr-auto md:border-r md:border-l-0 md:pr-10 md:pl-0 md:text-right'}"
        >
          <span
            class="wh-step-number absolute top-0 flex h-9 w-9 items-center justify-center rounded-full border border-secondary transition-colors duration-500 md:h-20 md:w-20 md:text-[22px] {isActive(
              i,
            )
              ? 'bg-secondary text-white'
              : 'bg-white text-secondary'} {i % 2 === 0
              ? '-left-[18px] md:-left-10'
              : '-left-[18px] md:right-[-40px] md:left-auto'}"
            aria-hidden="true">{i + 1}</span
          >
          <h3
            class="wh-h3 pt-1 text-secondary md:pt-5 {i % 2 === 0
              ? 'md:text-left'
              : 'md:text-right'}"
          >
            <span class="sr-only">{`Step ${i + 1}: `}</span>{step.title}
          </h3>
          {#if isFilled.richText(step.body)}
            <div
              class="wh-prose mt-2 text-secondary transition-opacity duration-500 {isActive(i)
                ? 'opacity-100'
                : 'opacity-0'}"
            >
              <RichTextBody field={step.body} />
            </div>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</section>
