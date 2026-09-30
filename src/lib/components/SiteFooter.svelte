<script lang="ts">
  import { FOOTER_LINKS } from "$lib/contact";

  const year = new Date().getFullYear();
</script>

<footer class="bg-secondary px-4 py-16 text-white">
  <div class="mx-auto flex max-w-[1280px] justify-between gap-8">
    <a href="/" class="block" aria-label="Williamson Homes, home">
      <img src="/images/williamson-w.svg" alt="" class="block h-24" />
      <img src="/images/williamson-homes-logo.svg" alt="" class="wh-filter-white mt-8 block h-16" />
    </a>
    <nav aria-label="Footer">
      <ul class="flex flex-col gap-8 text-right">
        {#each FOOTER_LINKS as link (link.href)}
          <li><a href={link.href} class="text-white">{link.label}</a></li>
        {/each}
      </ul>
    </nav>
  </div>
  <p class="mx-auto mt-16 max-w-[1280px] text-xs text-white italic">
    © Williamson Homes {year}, All Rights Reserved
  </p>
</footer>
