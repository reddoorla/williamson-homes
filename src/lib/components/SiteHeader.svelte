<script lang="ts">
  import { Menu, X } from "@lucide/svelte";
  import { page } from "$app/state";
  import { trapFocus } from "$lib/actions/trapFocus";
  import { NAV_LINKS } from "$lib/contact";

  type Props = { tone?: "light" | "dark" };

  let { tone = "dark" }: Props = $props();

  let menuOpen = $state(false);
  let pastTop = $state(false);
  let scrolledUp = $state(false);
  let focusWithin = $state(false);
  const sidekick = $derived(pastTop && (scrolledUp || focusWithin));
  let lastY = 0;
  let menuButton = $state<HTMLButtonElement>();

  const isCurrent = (href: string) =>
    page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

  function onScroll() {
    const y = window.scrollY;
    pastTop = y > 120;
    scrolledUp = pastTop && y < lastY;
    lastY = y;
  }

  const closeMenu = () => (menuOpen = false);
</script>

<svelte:window onscroll={onScroll} />

<header class="wh-header absolute inset-x-0 top-0 z-50" data-tone={tone}>
  <div class="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 md:h-[120px]">
    <a href="/" class="block" aria-label="Williamson Homes, home">
      <img
        src="/images/williamson-homes-logo.svg"
        alt=""
        class="h-12 pr-8 {tone === 'light' ? 'wh-filter-white' : ''}"
      />
    </a>
    <nav aria-label="Main" class="hidden md:block">
      <ul class="flex gap-4">
        {#each NAV_LINKS as link (link.href)}
          <li>
            <a
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              class="p-2 text-base whitespace-nowrap {tone === 'light'
                ? 'text-white'
                : 'text-primary'}">{link.label}</a
            >
          </li>
        {/each}
      </ul>
    </nav>
    <button
      bind:this={menuButton}
      type="button"
      class="p-2 md:hidden {tone === 'light' ? 'text-white' : 'text-primary'}"
      aria-label="Open menu"
      aria-controls={menuOpen ? "wh-menu" : undefined}
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = true)}
    >
      <Menu aria-hidden="true" />
    </button>
  </div>
</header>

<div
  class="wh-sidekick fixed inset-x-0 top-0 z-40 hidden bg-primary transition-transform duration-200 md:block"
  class:-translate-y-full={!sidekick}
  aria-hidden={!sidekick}
  inert={!sidekick}
  onfocusin={() => (focusWithin = true)}
  onfocusout={(event) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) focusWithin = false;
  }}
>
  <div class="mx-auto flex h-[120px] max-w-[1280px] items-center justify-between px-4">
    <a href="/" class="block" aria-label="Williamson Homes, home">
      <img src="/images/williamson-homes-logo.svg" alt="" class="wh-filter-white h-12 pr-8" />
    </a>
    <nav aria-label="Main, sticky">
      <ul class="flex gap-4">
        {#each NAV_LINKS as link (link.href)}
          <li>
            <a
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              class="p-2 text-base whitespace-nowrap text-white">{link.label}</a
            >
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</div>

{#if menuOpen}
  <div
    id="wh-menu"
    class="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-primary md:hidden"
    role="dialog"
    aria-modal="true"
    aria-label="Menu"
    use:trapFocus={{ onEscape: closeMenu, restoreFocus: () => menuButton }}
  >
    <button
      type="button"
      class="absolute top-6 right-4 p-2 text-white"
      aria-label="Close menu"
      onclick={closeMenu}
    >
      <X aria-hidden="true" />
    </button>
    {#each NAV_LINKS as link (link.href)}
      <a
        href={link.href}
        aria-current={isCurrent(link.href) ? "page" : undefined}
        class="text-2xl text-white"
        onclick={closeMenu}>{link.label}</a
      >
    {/each}
  </div>
{/if}
