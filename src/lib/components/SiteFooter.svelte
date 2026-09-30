<script lang="ts">
  import { FOOTER_LINKS } from "$lib/contact";

  const year = new Date().getFullYear();
</script>

<footer class="bg-secondary px-4 pt-32 pb-32 text-white">
  <div class="mx-auto flex max-w-[1280px] flex-col md:flex-row md:justify-between md:gap-8">
    <a href="/" class="block" aria-label="Williamson Homes, home">
      <img src="/images/williamson-w.svg" alt="" class="block h-24" />
      <img
        src="/images/williamson-homes-logo.svg"
        alt=""
        class="wh-filter-white mt-16 block h-16"
      />
    </a>
    <nav aria-label="Footer">
      <ul class="flex flex-col gap-16 pb-16 text-right">
        {#each FOOTER_LINKS as link (link.href)}
          <li><a href={link.href} class="text-white">{link.label}</a></li>
        {/each}
      </ul>
    </nav>
  </div>
  <p class="mx-auto max-w-[1280px] text-xs text-white italic">
    © Williamson Homes {year}, All Rights Reserved
  </p>
</footer>
