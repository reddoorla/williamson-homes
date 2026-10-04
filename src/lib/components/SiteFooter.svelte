<script lang="ts">
  import { FOOTER_LINKS } from "$lib/contact";

  const year = new Date().getFullYear();
</script>

<footer class="bg-secondary pt-32 pb-32 text-white">
  <div
    class="mx-auto flex max-w-[1280px] flex-col px-[30px] md:flex-row md:justify-between md:gap-8"
  >
    <a href="/" class="wh-hover-fade block" aria-label="Williamson Homes, home">
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
          <li>
            <a
              href={link.href}
              class="wh-link wh-hover-fade ml-auto block w-fit text-white [--wh-hover-opacity:.87]"
              >{link.label}</a
            >
          </li>
        {/each}
      </ul>
    </nav>
  </div>
  <p class="mx-auto max-w-[1280px] px-5 text-xs text-white italic md:text-[14px] md:leading-5">
    © Williamson Homes {year}, All Rights Reserved
  </p>
</footer>
