<script lang="ts">
  import { page } from "$app/state";
  import { trapFocus } from "$lib/actions/trapFocus";
  import { NAV_LINKS } from "$lib/contact";

  type Props = { tone?: "light" | "dark" };

  let { tone = "dark" }: Props = $props();

  let menuOpen = $state(false);
  let pastTop = $state(false);
  let scrolledUp = $state(false);
  let focusWithin = $state(false);
  let heroOut = $state(false);
  const sidekick = $derived(pastTop && (scrolledUp || focusWithin));
  let lastY = 0;
  let menuButton = $state<HTMLButtonElement>();
  let headerEl = $state<HTMLElement>();
  let sidekickEl = $state<HTMLElement>();

  const isCurrent = (href: string) =>
    page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

  function heroBottom() {
    const hero = document.querySelector("#main-content > :first-child");
    if (!(hero instanceof HTMLElement)) return 0;
    return hero.getBoundingClientRect().bottom + window.scrollY;
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
    const threshold = bottom > 0 ? bottom + 200 : 120;
    if (y <= threshold && pastTop && focusWithin) handFocusToHeader();
    heroOut = bottom > 0 && y >= bottom;
    pastTop = y > threshold;
    scrolledUp = pastTop && y < lastY;
    lastY = y;
  }

  const closeMenu = () => (menuOpen = false);
</script>

<svelte:window onscroll={onScroll} />

<header
  bind:this={headerEl}
  class="wh-header fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-500 ease-out md:h-[120px] {heroOut
    ? 'max-[479px]:bg-primary'
    : ''}"
  data-tone={tone}
  data-hero-out={heroOut ? "" : undefined}
>
  <div
    class="wh-hero-header mx-auto flex max-w-[1280px] items-start justify-between px-2.5 transition-transform duration-500 {heroOut
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
    class="wh-hamburger absolute top-6 right-8 block h-8 w-8 transition-opacity duration-200 hover:opacity-[.66] md:hidden"
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
  <div class="mx-auto flex h-[120px] max-w-[1280px] items-start justify-between px-2.5">
    <a href="/" class="wh-hover-fade block py-8" aria-label="Williamson Homes, home">
      <img
        src="/images/williamson-homes-logo.svg"
        alt=""
        width="180"
        class="wh-filter-white h-12 w-[180px] pr-8"
      />
    </a>
    <nav aria-label="Main, sticky" class="py-8 pl-8">
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
      class="wh-menu-close absolute top-8 right-8 block h-8 w-8 transition-opacity duration-200 hover:opacity-[.66]"
      aria-label="Close menu"
      onclick={closeMenu}
    >
      <img src="/images/menu-close.png" alt="" class="wh-filter-white block h-8 w-8" />
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
