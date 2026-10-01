<script lang="ts" module>
  export const PAIR_TRANSITION = "[transition:background-color_.25s_ease-in,opacity_.25s_ease-in]";
  export const SINGLE_TRANSITION = "[transition:background-color_.2s_ease-in,opacity_.25s_ease-in]";

  export const PAIR_HOVER = {
    light: "hover:bg-secondary/15 hover:opacity-80",
    primary: "hover:bg-secondary/15 hover:opacity-85",
    secondary: "hover:bg-secondary/4",
  } as const;

  export const SINGLE_HOVER = {
    light: "hover:bg-secondary/35 hover:opacity-80",
    primary: "hover:bg-secondary/10 hover:opacity-90",
    secondary: "hover:bg-secondary/4",
  } as const;

  export const unfaded = (classes: string) =>
    classes
      .split(" ")
      .filter((c) => !c.startsWith("hover:opacity-"))
      .join(" ");
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  type Tone = "light" | "secondary" | "primary";
  type Props = {
    href: string;
    tone?: Tone;
    single?: boolean;
    flat?: boolean;
    class?: string;
    children: Snippet;
  };

  let {
    href,
    tone = "light",
    single = false,
    flat = false,
    class: passedClasses = "",
    children,
  }: Props = $props();

  const toneClass = $derived(
    (
      {
        light: "border-white text-white",
        secondary: "border-secondary text-secondary",
        primary: "border-primary text-primary",
      } as const
    )[tone],
  );
  const hoverClass = $derived.by(() => {
    const hover = (single ? SINGLE_HOVER : PAIR_HOVER)[tone];
    return `${single ? SINGLE_TRANSITION : PAIR_TRANSITION} ${flat ? unfaded(hover) : hover}`;
  });
</script>

<a
  {href}
  class="wh-button inline-block border-b px-2.5 py-[9px] text-[0.8rem] leading-5 {hoverClass} {toneClass} {passedClasses}"
>
  {@render children()}
</a>
