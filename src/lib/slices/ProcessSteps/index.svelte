<script lang="ts">
  import { onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { isFilled, type Content } from "@prismicio/client";
  import RichTextBody from "$lib/components/RichTextBody.svelte";
  import {
    progress,
    railLength,
    stageLengths,
    stepLooks,
    trackHeight,
    type Progress,
  } from "./stage";

  let { slice }: { slice: Content.ProcessStepsSlice } = $props();

  const steps = $derived(slice.items.filter((item) => item.title));
  const tall = $derived(slice.primary.step_height === "tall");
  const HEADROOM = 48;

  let pinning = $state(false);
  let roomy = $state(true);
  const gap = $derived(roomy ? (tall ? 360 : 240) : tall ? 300 : 200);
  const circle = $derived(roomy ? 80 : 36);
  let at: Progress = $state({ t: 0, solid: 0 });
  let track = $state(0);
  let stageTop = $state(0);
  let stageHeight = $state(0);
  let areaHeight = $state(0);

  let trackEl: HTMLElement | undefined = $state();
  let headEl: HTMLElement | undefined = $state();
  let stepEls: HTMLLIElement[] = $state([]);

  const looks = $derived(stepLooks(steps.length, at, !roomy));
  const rail = $derived(railLength(steps.length, at));

  let wide: MediaQueryList | undefined;
  let reduced: MediaQueryList | undefined;
  let frame = 0;
  let sized = false;

  function size() {
    const viewport = window.innerHeight;
    const tallest = Math.max(0, ...stepEls.filter(Boolean).map((el) => el.offsetHeight));
    areaHeight = HEADROOM + Math.max(tallest + 64, gap + 80);
    const content = (headEl?.offsetHeight ?? 0) + areaHeight + 96;
    if (!roomy && content > viewport) {
      pinning = false;
      at = { t: 0, solid: 0 };
      return;
    }
    stageHeight = content;
    stageTop = content <= viewport ? Math.round((viewport - content) / 2) : viewport - content;
    track = trackHeight(stageHeight, steps.length, stageLengths(viewport, tall));
    sized = true;
  }

  function measure() {
    frame = 0;
    if (!pinning || !trackEl) return;
    if (!sized) size();
    const box = trackEl.getBoundingClientRect();
    if (box.bottom < -window.innerHeight || box.top > 2 * window.innerHeight) return;
    at = progress(stageTop - box.top, steps.length, stageLengths(window.innerHeight, tall));
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure);
  }

  function resize() {
    if (roomy) {
      sized = false;
      schedule();
    } else sync();
  }

  function sync() {
    roomy = !!wide?.matches;
    pinning = !reduced?.matches;
    sized = false;
    if (!pinning) at = { t: 0, solid: 0 };
    else schedule();
  }

  afterNavigate(() => {
    if (wide || typeof window.matchMedia !== "function") return;
    wide = window.matchMedia("(min-width: 768px)");
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    wide.addEventListener?.("change", sync);
    reduced.addEventListener?.("change", sync);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    sync();
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;
    wide?.removeEventListener?.("change", sync);
    reduced?.removeEventListener?.("change", sync);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", resize);
    if (frame) cancelAnimationFrame(frame);
  });

  const mix = (amount: number) =>
    amount >= 1
      ? "var(--color-primary)"
      : `color-mix(in srgb, var(--color-primary) ${Math.round(amount * 100)}%, var(--color-secondary))`;

  const ink = (amount: number) =>
    amount >= 1
      ? "var(--color-secondary)"
      : `color-mix(in srgb, var(--color-secondary) ${Math.round(amount * 100)}%, white)`;
</script>

<section
  id={slice.primary.section_id || undefined}
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  data-pinning={pinning ? "" : undefined}
  data-solid={pinning && at.solid >= 1 ? "" : undefined}
  class="px-4 {tall ? 'pt-16' : ''}"
>
  <div
    bind:this={trackEl}
    class="wh-steps-track relative"
    style:height={pinning && track ? `${track}px` : undefined}
  >
    <div
      class="wh-steps-stage mx-auto max-w-[948px] {pinning ? 'sticky overflow-hidden pt-10' : ''}"
      style:top={pinning ? `${stageTop}px` : undefined}
      style:height={pinning && stageHeight ? `${stageHeight}px` : undefined}
    >
      <div
        bind:this={headEl}
        class="wh-steps-head bg-white {pinning ? '' : tall ? 'md:pt-8' : 'pt-16 md:pt-32'}"
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
        class="wh-steps relative mx-auto mt-16 w-full max-w-[800px] md:max-w-none {pinning
          ? 'md:mt-2 [mask-image:linear-gradient(to_bottom,#000_calc(100%-6rem),transparent)]'
          : 'md:before:absolute md:before:top-0 md:before:left-1/2 md:before:w-px md:before:-translate-x-1/2 md:before:bg-secondary md:mt-0 ' +
            (tall ? 'md:before:bottom-[36rem]' : 'md:before:bottom-[13.5rem]')}"
        style:height={pinning && areaHeight ? `${areaHeight}px` : undefined}
      >
        {#if pinning}
          <span
            class="wh-steps-rail absolute top-[84px] left-5 w-px -translate-x-1/2 bg-secondary md:top-32 md:left-1/2"
            style:height="{Math.max(0, rail * gap - circle)}px"
            aria-hidden="true"
          ></span>
        {/if}
        {#each steps as step, i (i)}
          {@const look = looks[i]}
          {@const lit = !!look?.active}
          {@const solid = pinning ? (look?.solid ?? 0) : 0}
          {@const arriving = pinning && !lit && (look?.rise ?? 0) > 0}
          <li
            bind:this={stepEls[i]}
            data-active={lit ? "" : undefined}
            style:transform={pinning ? `translate3d(0, ${look.rise * gap}px, 0)` : undefined}
            style:z-index={pinning ? i + 1 : undefined}
            class="wh-step border-secondary pb-8 pl-10 md:w-1/2 {pinning
              ? 'absolute top-12 right-0 left-5'
              : 'relative border-l md:border-l-0 ' +
                (tall ? 'md:min-h-[40rem]' : 'md:min-h-[15rem]')} {i % 2 === 0
              ? pinning
                ? 'md:right-auto md:left-1/2 md:pl-16'
                : 'md:ml-auto md:pl-16'
              : pinning
                ? 'md:right-1/2 md:left-auto md:pr-16 md:pl-0 md:text-right'
                : 'md:mr-auto md:pr-16 md:pl-0 md:text-right'}"
          >
            <span
              class="wh-step-number wh-h3 absolute top-0 flex h-9 w-9 items-center justify-center rounded-full border border-secondary transition-colors duration-300 ease-[cubic-bezier(.215,.61,.355,1)] md:h-20 md:w-20 {lit
                ? pinning
                  ? 'bg-secondary text-white'
                  : 'bg-white text-secondary md:bg-secondary md:text-white'
                : 'bg-white text-secondary'} {i % 2 === 0
                ? '-left-[18px] md:-left-10'
                : '-left-[18px] md:right-[-40px] md:left-auto'}"
              style:opacity={pinning && !arriving ? look.opacity : undefined}
              style:background-color={solid > 0 ? mix(solid) : undefined}
              style:border-color={solid > 0 ? mix(solid) : arriving ? ink(look.opacity) : undefined}
              style:color={arriving ? ink(look.opacity) : undefined}
              style:transform={solid > 0
                ? `scale(${1 + 0.08 * Math.sin(Math.PI * solid)})`
                : undefined}
              aria-hidden="true"
            >
              {#if pinning && i === steps.length - 1}
                <span
                  class="wh-step-halo pointer-events-none absolute -inset-px rounded-full border border-primary opacity-0"
                ></span>
              {/if}
              {i + 1}
            </span>
            <h3
              class="wh-h3 pt-1 text-secondary md:pt-5 {i % 2 === 0
                ? 'md:text-left'
                : 'md:text-right'}"
              style:opacity={pinning ? look.titleOpacity : undefined}
              style:color={solid > 0 ? mix(solid) : undefined}
            >
              {step.title}
            </h3>
            {#if isFilled.richText(step.body)}
              <div
                class="wh-prose mt-2 text-secondary md:mt-0"
                style:opacity={pinning ? look.textOpacity : undefined}
              >
                <RichTextBody field={step.body} />
              </div>
            {/if}
          </li>
        {/each}
      </ol>
    </div>
  </div>
</section>

<style>
  section[data-solid] :global(.wh-step-halo) {
    animation: wh-halo 1100ms cubic-bezier(0.215, 0.61, 0.355, 1) both;
  }

  @keyframes wh-halo {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(1.9);
    }
  }
</style>
