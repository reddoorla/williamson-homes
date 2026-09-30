<script lang="ts">
  type Props = {
    variant?: "white" | "black" | "ocean";
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
  class="mx-auto block {variant === 'black' ? 'wh-filter-black' : ''} {passedClasses}"
/>
