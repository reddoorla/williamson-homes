<script lang="ts">
  import { onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";
  import { counterStates, restingStates, type StepState } from "./counters";

  let { slice }: { slice: Content.ProcessStepsSlice } = $props();

  const steps = $derived(slice.items.filter((item) => item.title));
  const tall = $derived(slice.primary.step_height === "tall");

  let pinning = $state(false);
  let live: StepState[] | null = $state(null);
  let stepEls: HTMLLIElement[] = $state([]);

  const states = $derived(live ?? restingStates(steps.length));

  let wide: MediaQueryList | undefined;
  let reduced: MediaQueryList | undefined;
  let frame = 0;

  function measure() {
    frame = 0;
    if (!pinning) return;
    const els = stepEls.filter(Boolean);
    live = counterStates(
      els.map((el) => el.getBoundingClientRect().top),
      els.map((el) => el.offsetHeight),
    );
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure);
  }

  function sync() {
    pinning = !!wide?.matches && !reduced?.matches;
    if (!pinning) live = null;
    else schedule();
  }

  afterNavigate(() => {
    if (wide || typeof window.matchMedia !== "function") return;
    wide = window.matchMedia("(min-width: 768px)");
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    wide.addEventListener?.("change", sync);
    reduced.addEventListener?.("change", sync);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sync();
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;
    wide?.removeEventListener?.("change", sync);
    reduced?.removeEventListener?.("change", sync);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) cancelAnimationFrame(frame);
  });
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  data-pinning={pinning ? "" : undefined}
  class="px-4 {tall ? 'pt-16' : ''}"
>
  <div class="mx-auto max-w-[948px]">
    <div
      class="wh-steps-head bg-white md:h-64 {tall ? 'md:pt-8' : 'pt-16 md:pt-32'} {pinning
        ? 'md:sticky md:top-0 md:z-[4]'
        : ''}"
    >
      {#if slice.primary.heading}
        <h2 class="wh-h3 text-center text-primary">{slice.primary.heading}</h2>
      {/if}
      {#if isFilled.richText(slice.primary.intro)}
        <div class="wh-prose mx-auto mt-6 max-w-[600px] text-center text-secondary">
          <RichTextBody field={slice.primary.intro} />
        </div>
      {/if}
    </div>
    <ol
      class="wh-steps relative mx-auto mt-16 max-w-[800px] md:mt-0 md:max-w-none md:before:absolute md:before:top-0 md:before:left-1/2 md:before:w-px md:before:-translate-x-1/2 md:before:bg-secondary {tall
        ? 'md:before:bottom-[36rem]'
        : 'md:before:bottom-[13.5rem]'}"
    >
      {#each steps as step, i (i)}
        <li
          bind:this={stepEls[i]}
          data-active={states[i]?.active ? "" : undefined}
          style:opacity={live ? states[i].opacity : undefined}
          class="wh-step relative border-l border-secondary pb-8 pl-10 md:w-1/2 md:border-l-0 {tall
            ? 'md:min-h-[40rem]'
            : 'md:min-h-[15rem]'} {pinning ? 'md:sticky md:top-64' : ''} {i % 2 === 0
            ? 'md:ml-auto md:pl-16'
            : 'md:mr-auto md:pr-16 md:pl-0 md:text-right'}"
        >
          <span
            class="wh-step-number wh-h3 absolute top-0 flex h-9 w-9 items-center justify-center rounded-full border border-secondary bg-white text-secondary transition-colors duration-200 ease-[cubic-bezier(.215,.61,.355,1)] md:h-20 md:w-20 {states[
              i
            ]?.active
              ? 'md:bg-secondary md:text-white'
              : ''} {i % 2 === 0
              ? '-left-[18px] md:-left-10'
              : '-left-[18px] md:right-[-40px] md:left-auto'}"
            aria-hidden="true">{i + 1}</span
          >
          <h3
            class="wh-h3 pt-1 text-secondary md:pt-5 {i % 2 === 0
              ? 'md:text-left'
              : 'md:text-right'}"
            style:opacity={live ? states[i].titleOpacity : undefined}
          >
            <span class="sr-only">{`Step ${i + 1}: `}</span>{step.title}
          </h3>
          {#if isFilled.richText(step.body)}
            <div
              class="wh-prose mt-2 text-secondary md:mt-0"
              style:opacity={live ? states[i].textOpacity : undefined}
            >
              <RichTextBody field={step.body} />
            </div>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</section>
