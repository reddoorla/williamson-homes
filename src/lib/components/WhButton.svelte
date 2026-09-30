<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    href: string;
    tone?: "light" | "secondary" | "primary";
    class?: string;
    children: Snippet;
  };

  let { href, tone = "light", class: passedClasses = "", children }: Props = $props();

  const toneClass = $derived(
    (
      {
        light: "border-white text-white",
        secondary: "border-secondary text-secondary",
        primary: "border-primary text-primary",
      } as const
    )[tone],
  );
</script>

<a
  {href}
  class="wh-button inline-block border-b px-2.5 py-2 text-[0.8rem] uppercase tracking-[2px] transition-colors duration-200 hover:bg-secondary/10 {toneClass} {passedClasses}"
>
  {@render children()}
</a>
