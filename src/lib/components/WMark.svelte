<script lang="ts">
  type Props = {
    variant?: "white" | "black" | "tan" | "blue" | "ocean";
    class?: string;
  };

  let { variant = "white", class: passedClasses = "" }: Props = $props();

  const src = $derived(
    variant === "ocean" ? "/images/williamson-ocean-w.png" : "/images/williamson-w.svg",
  );
</script>

<img
  {src}
  alt=""
  class="mx-auto block {(
    {
      black: 'wh-filter-black',
      tan: 'wh-filter-tan',
      blue: 'wh-filter-blue',
    } as Record<string, string>
  )[variant] ?? ''} {passedClasses}"
/>
