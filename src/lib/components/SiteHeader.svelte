<script lang="ts">
  import { flushSync } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { trapFocus } from "$lib/actions/trapFocus";
  import { NAV_LINKS } from "$lib/contact";

  type Props = { tone?: "light" | "dark" };

  let { tone = "dark" }: Props = $props();

  const NO_HERO_BOTTOM = 120;

  let menuOpen = $state(false);
  let pastTop = $state(false);
  let scrolledUp = $state(false);
  let focusWithin = $state(false);
  let heroOut = $state(false);
  let headerFocus = $state(false);
  const away = $derived(heroOut && !headerFocus);
  const sidekick = $derived(focusWithin ? pastTop || heroOut : pastTop && scrolledUp);
  let lastY = 0;
  let cachedBottom: number | null = null;
  let menuButton = $state<HTMLButtonElement>();
  let headerEl = $state<HTMLElement>();
  let sidekickEl = $state<HTMLElement>();

  const isCurrent = (href: string) =>
    page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

  function heroBottom() {
    if (cachedBottom !== null) return cachedBottom;
    const hero = document.querySelector("#main-content [data-wh-hero]");
    cachedBottom =
      hero instanceof HTMLElement
        ? hero.getBoundingClientRect().bottom + window.scrollY
        : NO_HERO_BOTTOM;
    return cachedBottom;
  }

  function forgetHero() {
    cachedBottom = null;
  }

  function handFocusToHeader() {
    const active = document.activeElement;
    if (!(active instanceof HTMLAnchorElement) || !sidekickEl?.contains(active)) return;
    const href = active.getAttribute("href");
    const target = [...(headerEl?.querySelectorAll("a") ?? [])].find(
      (a) => a.getAttribute("href") === href,
    );
    target?.focus();
  }

  function onScroll() {
    const y = window.scrollY;
    const bottom = heroBottom();
    const threshold = bottom === NO_HERO_BOTTOM ? NO_HERO_BOTTOM : bottom + 200;
    heroOut = y >= bottom;
    pastTop = y > threshold;
    scrolledUp = pastTop && y < lastY;
    lastY = y;
    if (focusWithin && !heroOut && !pastTop) {
      flushSync();
      handFocusToHeader();
    }
  }

  afterNavigate(forgetHero);

  const closeMenu = () => (menuOpen = false);
</script>

<svelte:window onscroll={onScroll} onresize={forgetHero} />

<header
  bind:this={headerEl}
  class="wh-header fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-500 ease-out md:h-[120px] {heroOut
    ? 'max-md:bg-primary'
    : ''}"
  data-tone={tone}
  data-hero-out={heroOut ? "" : undefined}
>
  <div
    inert={away}
    onfocusin={() => (headerFocus = true)}
    onfocusout={(event) => {
      const next = event.relatedTarget as Node | null;
      if (!next || !event.currentTarget.contains(next)) headerFocus = false;
    }}
    class="wh-hero-header mx-auto flex max-w-[1280px] items-start justify-between px-2.5 transition-transform duration-500 ease-linear {away
      ? 'min-[480px]:-translate-y-[152px]'
      : 'min-[480px]:translate-y-px'}"
  >
    <a
      href="/"
      class="wh-hover-fade block py-4 max-[479px]:hidden md:py-8"
      aria-label="Williamson Homes, home"
    >
      <img
        src="/images/williamson-homes-logo.svg"
        alt=""
        width="180"
        class="h-12 w-[180px] pr-8 {tone === 'light' ? 'wh-filter-white' : ''}"
      />
    </a>
    <nav aria-label="Main" class="hidden py-8 pl-8 md:block">
      <ul class="flex">
        {#each NAV_LINKS as link, i (link.href)}
          <li>
            <a
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              class="wh-link wh-hover-fade mx-2 block p-2 whitespace-nowrap {i ===
              NAV_LINKS.length - 1
                ? 'mr-0'
                : ''} {tone === 'light' ? 'text-white' : 'text-primary'}">{link.label}</a
            >
          </li>
        {/each}
      </ul>
    </nav>
  </div>
  <button
    bind:this={menuButton}
    type="button"
    class="wh-hamburger absolute top-6 right-8 block h-8 w-8 transition-opacity duration-200 ease-[ease] hover:opacity-[.66] md:hidden"
    aria-label="Open menu"
    aria-controls={menuOpen ? "wh-menu" : undefined}
    aria-expanded={menuOpen}
    onclick={() => (menuOpen = true)}
  >
    <img
      src="/images/menu.svg"
      alt=""
      class="block h-8 w-8 {tone === 'light' || heroOut ? 'wh-filter-white' : ''}"
    />
  </button>
</header>

<div
  bind:this={sidekickEl}
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
  <nav
    aria-label="Main, sticky"
    class="mx-auto flex h-[120px] max-w-[1280px] items-start justify-between px-2.5"
  >
    <a href="/" class="wh-hover-fade block py-8" aria-label="Williamson Homes, home">
      <img
        src="/images/williamson-homes-logo.svg"
        alt=""
        width="180"
        class="wh-filter-white h-12 w-[180px] pr-8"
      />
    </a>
    <div class="py-8 pl-8">
      <ul class="flex">
        {#each NAV_LINKS as link, i (link.href)}
          <li>
            <a
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              class="wh-link wh-hover-fade mx-2 block p-2 whitespace-nowrap text-white {i ===
              NAV_LINKS.length - 1
                ? 'mr-0'
                : ''}">{link.label}</a
            >
          </li>
        {/each}
      </ul>
    </div>
  </nav>
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
      class="wh-menu-close absolute top-8 right-8 block h-8 w-8 transition-opacity duration-200 ease-[ease] hover:opacity-[.66]"
      aria-label="Close menu"
      onclick={closeMenu}
    >
      <img src="/images/menu-close.png" alt="" class="wh-filter-white block h-8 w-8" />
    </button>
    <a href="/" class="block" aria-label="Williamson Homes, home" onclick={closeMenu}>
      <img
        src="/images/williamson-homes-logo.svg"
        alt=""
        width="180"
        class="wh-filter-white h-12 w-[180px] pr-8"
      />
    </a>
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
