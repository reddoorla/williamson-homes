# Reddoor Starter — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. [STARTER.md](STARTER.md) says what
the stack ships; this is the history of getting it there.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 280 commits of history summarised rather than reconstructed (`chore/work-journal`)

> Superseded in part by 2026-09-08 — The Webflow rebuild pipeline has a home,
> and it is not this repo.

The journal starts today, so this first entry is a **backfill**: a deliberately
coarse summary of what came before, written from the commit log rather than
from memory. Detail below this line is trustworthy; detail above it is not, and
nothing here should be cited as though someone wrote it down at the time. The
commit log remains the record for anything before 2026-09-05.

**What this repo is.** A forkable SvelteKit 2 / Svelte 5 / Tailwind v4 /
Prismic starting point for every site Reddoor builds, deployed on Netlify. 280
commits from `initial` on 2024-02-22 to here — 72 in 2024, 68 in 2025, 140 in
2026, which is the shape of a template that stopped being a side project once
sites started shipping from it.

**The eras, roughly.** 2024 and 2025 are the slow build of the stack itself.
2026 is where the volume is, and it clusters: **July alone carries 61 commits**,
mostly the Blux migration track — a frozen-render pipeline for pixel-faithful
migration of an existing catalog site, proven on `the-pointe-burbank` and then
upstreamed (#78, #81–#84, #88, #89). That layer was snapshotted out to
[reddoor-starter-blux](https://github.com/reddoorla/reddoor-starter-blux) on
2026-08-31 as forward-merge-only, so this repo keeps the general case and the
Blux specifics live next door. August and September are consolidation: the
shared configs adopted so sync drift went to zero (#110), Prismic srcset widths
capped with a real `sizes` on every image (#109), and `Testimonial` and
`CtaBanner` added to the slice library, taking it to nine.

**One trap worth pulling forward, because it recurred downstream.** #74
(2026-07-18) reworded a comment in `src/app.html` so that `%sveltekit.body%`
was not trapped inside it — SvelteKit substitutes the **first** occurrence of a
placeholder and only the first, so merely _mentioning_ one in prose consumes
it. The fix was correct and it held. The lesson did not generalise: on
2026-09-04 the Vida Legacy Foundation site shipped the identical defect against
`%sveltekit.head%` **twice in one hour**, the second time while writing the
explanation of the first. A fix that lands in one repo as a one-line reword,
with no test and no note that the whole placeholder _family_ is affected, is a
fix that gets to happen again. That is a large part of why this journal exists.

**State as of this entry.** `main` at `2377e9c`, CI green. Nine shared slices,
each with `model.json`, `mocks.json` and a vitest suite. The `pnpm verify`
gate runs prettier → eslint → svelte-check → build → axe → unit + smoke, which
is exactly CI's order. `docs/NEW-SITE.md` lists what is still a template
default in a fresh clone.

**What changed today.** `CLAUDE.md` gained "The work journal", and this file
exists. Because this file ships with the template, every site generated from
the starter now starts with the convention rather than acquiring it later —
which was the actual gap: Vida Legacy Foundation accumulated four days of
hard-won detail in `CLAUDE.md` prose and PR bodies, where it is real but
unordered, because there was nowhere chronological to put it.

## 2026-09-05 — Ten retrospective rules made into defaults, and the half of the journal rule that was missing (#115, `15abd0d`)

Two changes, a few hours apart, and the second exists because a research pass
went looking for what the first got wrong.

**The ten rules landed (#115).** `scripts/figma-compare/` is now in the template
rather than in one site's repo, `package.json` ships
`reddoor.a11yRoutes: ["/"]` so a clone's axe gate measures a real page from the
first commit instead of only `/dev/a11y-fixtures`, and `CLAUDE.md` gained "Six
rules that came from shipping a site". The provenance of all ten is Vida Legacy
Foundation's `docs/workJournal.md`, written the same week.

**And the journal rule turned out to be half a mechanism.** It says an entry
that stops being true is never rewritten — a later entry corrects it and names
which one. That is right, and on its own it fails at the only moment it
matters. The correction goes to the bottom of the file. A reader searching for
"sticky band" or "Turnstile" lands in the middle, on the superseded paragraph,
and leaves with the answer that was already known to be wrong. Nothing in the
old entry points forward, because the rule forbade touching it.

So: one line under a superseded heading, `> Superseded in part by <date> —
<title>.` It asserts nothing and retracts nothing, so the record of what was
believed at the time survives whole; it only redirects. The distinction that
makes it safe is that a pointer is *navigation*, not *content* — the prohibition
is on editing the claim, and a pointer makes no claim.

The evidence it was needed showed up by accident. Sweeping the convention across
the fleet found `a-budget`'s `CLAUDE.md` already doing it by hand, uncommitted:
`**SUPERSEDED WHILE IN DEBT PAYOFF — see "Envelopes: pure retroactive" below.**`
Somebody hit the problem and invented the fix locally, which is usually the sign
that a convention is missing rather than that a person is wrong.

**One thing not to copy from the site that produced these rules.** Its
`CLAUDE.md` is 963 lines and ~13K tokens, loaded into every session whatever the
task. The only measured study of this file class (Gloaguen et al., ETH Zurich,
arXiv:2602.11988, Feb 2026 — 138 tasks, four agents) puts developer-written
context files at **+4% task success for +19% inference cost**, and concludes
that unnecessary requirements in them make tasks _harder_. The archive is worth
having; keeping all of it in the always-on file is not. Traps and history belong
in the journal, and `CLAUDE.md` should hold the minimum a session must not
violate. This starter’s own is 194 lines and should stay closer to that than to 963.

## 2026-09-08 — The Webflow rebuild pipeline has a home, and it is not this repo (`docs/webflow-pipeline-records`)

Docs only. Nothing Webflow-specific enters this template, and that is the
decision worth recording.

The 2026-08-31 track-split spec said the Webflow importer targets the native
`page` type. **That was a third true.** The importer also emits `person`,
`news_article` and `collection_item` documents, and Beachfront renders them
through a `CollectionList` slice and a collections loader wired into the page
route — all of which exist in the Blux track and in Beachfront, none of them
here. Believing the old sentence would have made "point the importer at a native
clone" sound like a small job.

So the pipeline lives next door: importer and seed runner in reddoor-maintenance,
round scripts and the `/dev/match` twin installed by a new `match-harness`
recipe, the phase protocol in the `matching-a-page` skill, the round rules
written into each site's own `CLAUDE.md`. This repo gets one orientation row. The
rule behind that placement is what the Blux split taught: **the template ships no
hook whose default does work, and no field an editor cannot fill.** A "three-line
seam" in `page-load` was considered and rejected — same species as the two
document types probed per page load that native-ize deleted in #106 (242 files
changed, 178 deleted, slices 28 → 9, custom types 7 → 1, build 840K → 412K).

Lists on a rebuilt site are content relationships by default (a repeatable group
restricted to a type; order is the group's order; no route change), and automatic
indexes are dedicated routes with their own server load, like `/contact`. Both
are site-side patterns, not template mechanisms.

**The largest thing NOT done, so it is not rediscovered as new.** Fourteen
generic product-quality fixes Beachfront made between 2026-08-07 and 2026-09-02 —
noindex prefixes, reveal state in the markup, a focus-ring floor, live
reduced-motion, modal scroll-lock, nav tap response — are absent here and are
already propagating into sites bootstrapped from this template; Vida Legacy
Foundation inherited five of them on 2026-09-01 and independently re-fixed a
sixth. It is the largest per-site saving measured anywhere in this work (~18% of
a Beachfront-sized build, against ~10% for every conversion layer combined), and
it is now #121 on this repo with commits, files, native counterpart and a test
for each, one PR per item.

**Honest accounting, because this entry was drafted before the work it
describes.** The paragraphs above were written into the plan on 2026-09-08 and
are unchanged; what follows is what actually happened, and some of it contradicts
what was believed while planning. Two of the plan's own predictions were wrong on
contact. An empty Prismic repository does not 404 — it 500s, because the Content
API rejects the _predicate_ when nothing of that type is published. And the error
it gives, `unexpected field 'my.page.uid'`, was then documented as meaning "the
type was never pushed", which is also wrong: the same error appears with the type
registered, byte-identical to the error for a type that has never existed. Both
corrections are in reddoor-maintenance, the second one twice, because the first
fix asserted a discriminating check in both directions when it only holds in one.

That pattern is the entry's real content. Across one session, eight separate
claims failed the same way — a derived, cached, or configuration view of state
read as though it were the state. A CDN served a `no-store` response as a cache
hit. An author-filtered PR search returned a confident empty set because
self-hosted Renovate authors as a person, not an app. A `>>` redirect denied by a
sandbox still printed "appended", because the `echo` after it reports on itself.
Three of the eight were committed by someone actively holding the fleet rule
about positive evidence in mind, and one _while writing the correction to a
previous instance of it_. They are enumerated as reddoor-maintenance#711.

The eighth is the one worth carrying into this repo, because it is a different
shape and no rule here covers it. A verification step existed, was correct, was
run, and passed — and its coverage was exactly complementary to its bug: it
checked a CLI entry guard by invoking the script through a real path, and the
guard only fails when invoked through a symlink. An absent check is visibly
absent. A check blind in precisely the configuration that breaks reads as green
diligence. `CLAUDE.md`'s existing rules tell you to demand positive evidence and
to enumerate the class; neither tells you to ask **under what invocation the
evidence was produced, and whether that is the invocation that fails.**

## 2026-09-17 — Ready for site #2, except the a11y gate has been measuring a 404 page (audit only, no code change; #147)

A fifteen-agent workflow asked one question before the second client site is built
from this template: can `/new-site` clone `origin/main` today and produce a green
site? Four readiness audits — the starter itself, the `/new-site` and
`/figma-slices` skills, the Vida Legacy Foundation backport, and the
fleet-maintenance side — each had an adversarial verifier whose job was to
confirm, partially confirm or refute, and to list the claims that rested on the
absence of an error rather than on an artifact. Nothing in this repo was changed
today. This entry records what the audit found about the template and the
pipeline; the client-specific inventory is being written into another repo.

**The answer is yes, with numbers.** A fresh clone of `origin/main` at `0859ab8`,
with `/new-site`'s bootstrap edits applied (package name, the `netlify-site` CI
input, `SITE_NAME`, the README placeholders), installs from the frozen lockfile
and passes `pnpm verify`: prettier clean, eslint over 165 files with 0 errors and
0 warnings, svelte-check `COMPLETED 4519 FILES 0 ERRORS 0 WARNINGS`, a build, the
a11y audit, 60 test files / 469 unit tests, and 12 smoke specs. CI on that same
SHA (run 35182451450) logged the same counts, so the local run is not a different
configuration that happens to agree. eslint and prettier really do reach the
`.svelte` files — 46 of them, 0 different — which is the hole `.prettierrc`
closed and is worth re-measuring rather than assuming.

**The most valuable correction is that the a11y green is vacuous at bootstrap.**
The template ships `reddoor.a11yRoutes: ["/"]`, and `/new-site` step 3c sets it
before Prismic exists. While the `your-prismic-repo-name` sentinel is in place,
`/` returns 404 on purpose — `tests/smoke/routes.ts` knows that and asserts it.
The a11y audit does not: `@reddoorla/maintenance` 0.93.1, which the lockfile
pins, calls `page.goto(path)` and hands the page straight to axe with no status
check, so axe scans the SvelteKit error page and reports zero violations for a
home page that does not exist. A verifier reproduced the whole shape in its own
clone rather than trusting the auditor's logs: on 0.93.1 with `a11yRoutes ["/"]`,
`pnpm test:a11y` exits 0 and prints "0 violations across 2 routes"; pinned to
0.96.0 with the same config it exits 1 with `{id: "route-missing", impact:
"serious", route: "/", help: "/ returned 404"}`; the control, 0.96.0 with
`a11yRoutes []`, exits 0 again. The status branch first appears in v0.96.0 and is
absent from 0.93.1 through 0.95.1.

That matters more than a stale pin. This repo's own first rule says a pass must
require an artifact only a working system produces, and that a field which can
only observe configuration must not be named after the thing it cannot observe.
Here the rule fails _inside the instrument that enforces the other rules_: the
gate whose whole job is to produce positive evidence about rendered pages has
been producing an absence-of-violations result on an error page, and every
previous audit that cited "a11y: 0 violations" as evidence of health — including
this one's own positive-evidence list, as its verifier pointed out — inherited
that vacuity. The verifier also corrected the blast radius. Nothing is red today,
because `main` and fresh clones pin 0.93.1 and the shared Renovate config only
acts before 6pm on Mondays with a one-day `minimumReleaseAge`, so the earliest
window is 2026-09-21. When it fires, the red lands on the grouped
`renovate/all-minor-patch` PR, which carries `@lucide/svelte`, `@playwright/test`,
eslint, prettier, svelte, vite, typescript-eslint and the `reddoorla/.github` pin
along with the maintenance bump. One 404 therefore stalls every non-major update
in the group, not just the bump that exposes it.

**A fix that looked obvious would have broken the template.** The natural
follow-on to bumping to 0.96.0 is to take the new `reddoor.gateServer:
"preview"` option, which answers this repo's "verify on a production build" rule
and VLF's open issue about it. Two verifiers independently showed that setting it
at bootstrap is wrong. Under `preview`, the v0.96.0 Playwright `webServer` runs
the build and probes `http://localhost:<port>/` for readiness, and Playwright
1.62.1 treats a server as ready only for `statusCode >= 200 && statusCode < 404`
— so on the placeholder, where `/` is a deliberate 404, the server never becomes
ready and both gates fail at the five-minute timeout. Separately, the starter's
own browser specs target `/dev/a11y-fixtures` and `/dev/animate-in`, which `#134`
made 404 in a production build, so they would fail under preview even with a home
page. The order is: bootstrap on the dev server and report explicitly that the
gate is not yet measuring the site, publish the home document, then opt into
preview and split the `/dev`-targeting specs into their own project. One more
correction from the same thread: `gateServer` moves the hydration smoke, not the
axe scan, which stays on `vite dev` by design.

**VLF's process lessons came back; its code lessons largely did not.** The six
standing rules, the journal convention with its forward-pointer clause, the
figma-compare harness with the cap-height trim recorded per style, real
`a11yRoutes` at bootstrap, the locale-string inventory and the review-round rules
all landed here or in the skills. The generic defects VLF found while fixing its
own did not, and four of them were re-measured today rather than taken on
report. A Prismic preview of any non-home page lands on `/`: since `#90` the
client is routes-free, so the Content API leaves `doc.url` null, `/api/preview`
passes the bare client to `redirectToPreviewURL`, and `asLink` with no
linkResolver returns null, falling back to `defaultURL`. Run against the
installed `@prismicio/client` 7.22.0 with a stubbed fetch returning
`{uid: "about", url: null}`, this template answers `Location: /preview/` where
VLF's wrapper answers `Location: /preview/about`. The `--screen-*` tokens in
`app.css` are Tailwind v3 naming that v4 ignores: compiling `@theme { --screen-sm:
560px; --screen-xl: 1340px }` with the installed `@tailwindcss/node` 4.3.3 emits
`@media (width >= 40rem)` and `@media (width >= 80rem)`, so `sm` is really 640px
and `xl` really 1280px and the declared 560/1340 are dead — the second site to
rediscover this, after the Beachfront note. The fleet's Typekit swap,
`media="print" onload="this.media='all'"`, is an inline handler that the nonce
CSP refuses; measured in Chromium, media stays `print` and `faces=0`. The
verifier refuted half of that finding as received: all 210 font URLs in kit
`noj4tji.css` are `use.typekit.net/af/...`, so faces register and load with only
`use.typekit.net` in `style-src` and `font-src`; `p.typekit.net` is needed only
to silence the console error from the `p.css` tracking `@import`, which matters
because a console-error smoke assertion would fail on it. And `Nav.svelte` has no
no-JS path below `lg`: the link list is `hidden ... lg:flex` and the menu exists
only inside `{#if isMenuOpen}`, so a phone visitor without JS cannot navigate at
all — while the fleet Playwright config still forces `reducedMotion: "reduce"` on
every test, which is what made a class of no-JS assertions vacuous before.

**Four fleet-side facts would bite site #2 on day one.** The local maintenance
`dist/` was built at 2026-09-15 11:05, four hours before `#812` landed at 15:10,
so `ensure-site --name` still behaves create-only there; the skill never passes
`--name` anyway, which is why two fleet rows still carry their bare slug as the
client-facing Name sixteen days later. Checking `--version` does not detect this,
because the CLI reads its version from `package.json` at runtime and this stale
build cheerfully prints `0.96.0`. `sync-configs` still decides by exact byte
match for eslint, playwright, lighthouse and prettier: today's starter plans zero
writes, but VLF's `origin/main` plans two, and one of them replaces a 3020-byte
`playwright.config.ts` carrying a four-project no-JS/phone rendering matrix with
the 74-byte re-export — the suite still passes afterwards and simply covers less.
Across 24 local checkouts the planner would overwrite 38 such files. The starter
sits on maintenance 0.93.1 against a released 0.96.0, and on `reddoorla/.github`
v1.4.1 against v1.4.2 (22 of 23 org repos are on the old pin); v1.4.2 is the
commit that stops apt reading Google's Chrome repo, the failure that took out
every fleet CI run three times in forty minutes on 2026-09-09.

**Two of the traps the verifiers found are not about code at all.**
`ensure-site` throws unless the display name slugifies back to the slug, and
`siteSlug` lowercases and collapses non-alphanumerics, so the skill's own example
slug cannot take the client's real name — the slug decides the client-facing
name, in auto-reply copy and report subjects, and it also becomes the GitHub repo,
the Netlify site, the forms-ingest path and the suggested Prismic repo name.
Deciding it late means renaming five systems; the operator has now settled on
`roalson-interests`. The second: `FIGMA_PAT` is the only working Figma REST
credential on this machine — a read-only `/v1/me` with it returns 200 — and it is
what `scripts/figma-compare/pull-figma.mjs` in _this_ repo consumes at Stage A.
It appears on the maintenance meta-week list of "the four keys nothing reads",
tagged as measured, because that census grepped only the maintenance repo and
never saw the consumer that lives here. Carrying out that five-minute rider would
have deleted Stage A's credential days before it is needed.

**Honest accounting about the audit itself.** The verifiers' most useful output
was not the confirmations but the list of claims resting on absence of evidence:
grep finding no analytics IDs or font-kit strings is not proof the routes are
clean; `gh repo create --help` listing `--public` is not a repo created;
`node --check` passing on the figma-compare scripts is not the harness run
against a comp; "`/dev` routes 404 in production" was verified by observing that
the guard file exists in both repos, with no production build loaded; the
scroll-reveal no-JS spec was read, not mutated to watch it go red. Several
severities were corrected downward on contact — the missing capability-index
mention in the skills is belt-and-braces now that `docs/COMPONENTS.md` is tracked
and `CLAUDE.md` points every session at it, and the chrome-link prerender failure
names its own referrer in the error, so it costs one failed build rather than an
afternoon. Two side effects are worth recording because someone will otherwise
pay for them without knowing why: the starter-health agent's unsandboxed run of
`playwright install chromium` made Playwright 1.62.1 evict the cached
`chromium-1243` and `chromium_headless_shell-1243` builds from
`~/Library/Caches/ms-playwright`, so every other checkout pinned to 1243 will
re-download them on its next install; and one agent briefly wrote a probe script
into the `reddoor-maintenance` checkout before deleting it seconds later.

**Nothing was fixed today.** No file in this repo changed; this entry is the only
artifact. The skill patches — the `--name` argument, the rebuild step, the gate
order, the Typekit and Turnstile traps — are being made in the `claude-skills`
repo, and the template-side work (bump maintenance to 0.96.0 behind a
sentinel-aware a11y audit, the CI pin to v1.4.2, and the VLF backports named
above) is a separate batch that has not landed.

## 2026-09-17 — The maintenance bump and the CI pin, held together by a gate that was scanning a 404 (#148, `chore/bump-maintenance-0.96-ci-v142`)

Two pins were stale — `@reddoorla/maintenance` at `^0.93.1` against a published
0.96.0, and the reusable CI workflow at `v1.4.1`. They went in one PR because
bumping the first one alone turns this template's own CI red, and the reason it
does is worth more than either bump.

**The pairing.** 0.96.0 carries the route-status guard from
reddoor-maintenance#807 (closing #680): a route listed in
`package.json` → `reddoor.a11yRoutes` that does not answer 200 is recorded as
`route-missing`, impact `serious`, and axe is **not** run over the error page.
This template ships `a11yRoutes: ["/"]` and sits on the `your-prismic-repo-name`
sentinel permanently, so `/` 404s by design — `src/routes/[[preview=preview]]/+page.server.ts`
calls `error(404)` while `isPlaceholderRepo`, and `tests/smoke/routes.ts`
asserts exactly that 404. The two are not in conflict; they were never
introduced to each other.

**Measured, both directions, on this tree with 0.96.0 installed.** The rule is
that a guard you have not watched go red is not a guard you have tested, so the
`["/"]` case was restored on purpose and run:

```
a11yRoutes ["/"]  → exit 1
  a11y: 1 violations across 3 routes (2 fixtures + 1 from package.json) — route-missing on / (/ returned 404)

a11yRoutes []     → exit 0
  a11y: 0 violations across 2 routes (+1 hydration smoke)
```

**The belief that was wrong before contact.** The instinct was that this bump
merely _broke_ the template's a11y gate. It did the opposite: it exposed that
the gate had never been measuring anything here. For as long as `["/"]` has been
in this file against the sentinel, `pnpm test:a11y` was loading the 404 page,
running axe over it, finding nothing to flag on a bare error page, and reporting
a pass. The line `0 violations` was true and meant nothing — the exact shape
CLAUDE.md's "a pass needs positive evidence" rule names. 0.96.0 did not create a
red; it converted a false green into an honest one.

**Honest accounting: that diagnosis is not this session's.** It was made and
measured in the 2026-09-17 readiness audit (#147), whose verifier pinned 0.93.1
with `a11yRoutes ["/"]` in a clone and watched `pnpm test:a11y` exit 0 printing
"0 violations across 2 routes" for a home page that does not exist, then pinned
0.96.0 with the same config and watched it exit 1. This session measured only
the two runs above — 0.96.0 with `["/"]` and with `[]` — and did not re-run
0.93.1. Anyone re-deriving the blast radius should read #147's entry, not this
one; it also records the part that made the timing matter, which is that the red
would otherwise have landed on the grouped `renovate/all-minor-patch` PR on
2026-09-21, stalling eight unrelated updates behind one 404.

**The fix here is a workaround, and the better one is filed.** The template set
`a11yRoutes` to `[]` and `docs/NEW-SITE.md` grew a section saying why, and
saying that a real site adds `"/"` back at `/new-site` step 6 once the Prismic
repository exists and a `home` document is published — at which point the 0.96
guard becomes a genuine positive-evidence check instead of a scan of a 404.
Empty is not "gate off": the audit still scans `/dev/a11y-fixtures` and
`/dev/animate-in` and still hydration-smokes `/`, which is why the green above
reads `2 routes (+1 hydration smoke)`.

But `[]` is the only answer available to a template that can never have a real
route. It is the wrong answer for a real site, because an empty list is
precisely the configuration that once let a critical `image-alt` violation ship
to five production pages with CI green. The better fix is to make the audit
sentinel-aware the way `tests/smoke/routes.ts` already is — read
`slicemachine.config.json`, and on `your-prismic-repo-name` either expect the
404 or skip the route _with a labeled note in the summary_. That is
reddoorla/reddoor-maintenance#863. It matters well beyond this repo: `/new-site`
step 3c points the gates at real routes at bootstrap, step 6 replaces the
sentinel, and **every new site lives between those two steps** — so its first
maintenance-bump PR goes red for something that is not a defect in the site, and
whoever picks it up either debugs a non-bug or learns to route around the gate.

**The CI pin, and why it is not cosmetic.** `v1.4.2` adds one step before
`playwright install --with-deps`: `sudo rm -f /etc/apt/sources.list.d/google-chrome.list`.
On 2026-09-09 Google's Chrome apt repo served a `Packages.gz` whose hash did not
match its own signed `Release`, apt refused the entire update with "Hash Sum
mismatch", and every fleet CI run died there before a single test ran — three
times in forty minutes. Nothing in this stack installs `google-chrome`;
Playwright brings its own Chromium. Dropping the source takes a third party we
do not depend on out of the critical path. Pinned to the full SHA
`c714d9e472885bbf66f386e9f056a16aab7986d2`, tag comment kept, per the fleet
convention — a tag is a movable ref and a short SHA is not a pin.

**Found and not fixed.** The `/new-site` skill's step 3c still carries a "known
reporting trap" note claiming the a11y pass summary always reads
`0 violations across 2 routes` no matter how many routes ran (reddoor-maintenance#697),
and tells the operator to poll for the audit's temp spec file to learn the
truth. The run above disproves it — 0.96.0 prints
`3 routes (2 fixtures + 1 from package.json)`. The note lives in the
`claude-skills` repo, so it could not be fixed in this PR; it is recorded in
reddoorla/reddoor-maintenance#863 so it is not lost.

**Merge order.** This branch was cut from `origin/main` while #147
(journal-only) was still open against the same file. The conflict in
`docs/workJournal.md` duly happened; it was resolved by rebasing onto #147 and
keeping both entries in the order they merged, since they are appends to the
same tail and neither contradicts the other.

## 2026-09-17 — Two template defects the second site paid for: a frozen copyright year and a text token that cannot be trusted with a brand colour (`fix/footer-year-and-text-contrast`)

Both of these were found by bootstrapping roalson-interests earlier today, and
both are template problems rather than that site's, so they are fixed here.

**The copyright year could only be right once.** `SiteConfig.footer.text` is a
plain string and `<Footer>` rendered it verbatim, falling back to
`© ${new Date().getFullYear()} Company Name`. So a site had two options: leave
the placeholder, which says "Company Name" on every page, or set `text` to its
own line — which freezes whatever year it typed. Correct in the January it is
written, wrong every January after, in a repo nobody is looking at. Roalson took
the second option at bootstrap and its footer now reads a hardcoded 2026.

`footer.owner` is the fix: the site names the entity, `<Footer>` supplies the
year. `text` stays, documented down to what it is actually for — a rights line
that is not of the form `© <year> <owner>`, which is why composition-hospitality
has one. Its test asserts the CURRENT year computed at assertion time rather
than a literal, because a literal expectation would pass for a year and then
start failing on a date nobody associates with the change.

**`--color-secondary` asserts something the template never checked.** The name
says the token is text-capable. A brand's "secondary colour" very often is not,
and the template spends this one as text in eight places a new site never
touches — footer copyright, `Field.svelte`'s description, the eyebrows on
LeadText, TextColumns and Testimonial, the testimonial role line, the contact
intro, a dev fixture. So assigning a light tint to it does not fail somewhere; it
fails on every page that renders a footer.

Roalson's dust `#B2AC9F` measured **1.97:1** on the page ground. The a11y gate
caught it, and that is later than it sounds: the gate needs a built site and a
browser, it names one node rather than the class, and on a fresh clone it is
pointed at fixtures — on a site that had not yet published a home document it
would not have run on a real page at all.

`src/lib/theme-contrast.test.ts` now parses the `@theme` block and measures
every text/ground pair the template actually composes, failing below 4.5:1 in
milliseconds with no browser. Both halves were proven by mutation rather than
asserted:

- setting `--color-secondary` to Roalson's dust fails two cases with
  `--color-secondary on --color-background is 2.26:1, below AA (4.5:1)` — and
  the message names the fix, which is to split the token rather than to change
  the pair being measured;
- changing one `text-secondary` to `text-accent` fails the completeness case
  with `unmeasured: accent`, so a new text token cannot quietly arrive without
  someone saying which ground it lands on.

**One measurement worth recording, which is NOT asserted.** In the shipped
placeholder palette `secondary` `#6b7280` on `light` `#e5e7eb` is **3.90:1** —
already below AA. `bg-light` is used 17 times and `text-secondary` 12 times, but
no component currently nests one in the other: in `/dev/animate-in`, the only
file with both, they are siblings. So the pair is not asserted, because
asserting it would fail the template's own defaults for a composition that does
not exist. It is one nesting away from being real, and that is written into the
test beside the list rather than left to be rediscovered.

**Honest accounting.** The class was not obvious from the failure. The first fix
here repointed the dev fixture at a new `-aa` token, which left the gate red,
because the fixture was never the failing element — the footer was.
`grep -rn "text-secondary"` returns eight files and was available the whole
time. CLAUDE.md already says to enumerate the class before fixing an instance;
this session still had to pay for it once before doing so.

## 2026-09-29 — The none-hued Tailwind palette gets explicit hues, so axe can measure the Hero (#152, PR to follow)

Tailwind 4.3 writes 13 palette entries with a `none` hue: every `neutral-*`,
`zinc-50` and `mauve-50`. The Hero slice's `bg-neutral-900`, for example, is
`oklch(20.5% 0 none)`. Browsers render `none` as 0. axe-core 4.13.0, the
latest release, cannot parse it. The Hero's white "Explore" CTA sits on that
band, so axe finds the CTA's white first. It then parses every element under
the CTA to build the stacking context, reaches the band, and throws. The
color-contrast rule is skipped for the whole `/dev/a11y-fixtures` page. The
gate fails only on violations, so the page read as clean. Contrast had not
been measured there at all.

@reddoorla/maintenance#916 turns that crash into a `rule-errored` failure. It
also turns text sitting directly on such a colour into a
`contrast-unmeasured` failure. Measured in a copy of this repo at `f96b4ac`
with a packed build of that PR:

- On main: `rule-errored on a11y fixtures`. The crash node was the CTA
  (`.inline-block`), and 0 color-contrast nodes were measured on the page.
- With this change: `0 violations across 2 routes`. 64 color-contrast nodes
  were measured on the fixtures page.
- On main with the locked 0.97.0: `0 violations`. That was the blind green.

The fix overrides the 13 tokens in `@theme` with Tailwind 4.3.3's own values,
with the hue written as 0. The screenshots of `oklch(L 0 none)` and
`oklch(L 0 0)` are byte-identical at all 11 lightness values, so nothing on
screen moves. Once Tailwind or axe is fixed upstream, the override can go,
but only after the gate has been seen passing without it.

The override sits inside the `@theme` block that `theme-contrast.test.ts`
scans, and it stays there. That put the 13 tokens in front of a guard that
read only hex. A later `text-neutral-600` would have failed as unclassified,
and classifying it would then have failed as "cannot measure oklch". This
was found by review, by adding a throwaway `text-neutral-600` line. The guard
now reads an achromatic `oklch(L 0 H)` as the sRGB encoding of L³ in linear
light, which gives Tailwind's own greys: #fafafa, #525252, #171717, #0a0a0a.
It still refuses a `none` hue. With the fix, the same probe passes both
steps (15 tests), and the probe was removed. This is the first part of #152.
Field's `red-600` failing AA off white, the issue's second part, is not
touched here.

## 2026-10-01 — Homes fidelity (OD7-P1b): counters, header scroll interactions, hovers, and a home gate that passes in the cloud (#10)

The brief called the reference's 20 IX2 scroll events "scroll-in". None of
them reveals content. All 20 drive the header:

- the hero leaving the viewport slides `.hero-header` up 152px over 500ms;
- the hero coming back puts it at `translateY(1px)`;
- at ≤479 the bar turns teal past the hero.

Reading the IX2 JSON, not counting event names, is what showed this. The
header is now fixed and runs those interactions, keyed off an explicit
`data-wh-hero`. The first version guessed the hero from
`#main-content`'s first child. On a project page that child is a 14331px
`<article>`, so the fixed header never hid; review caught it.

The sticky counters (`countersAnim.js`) are ported as a pure function of the
step tops, `counters.ts`. Against the live site's trace at 1440 the port
reads 0.65 and 0.23 where the live page reads 0.65 and 0.22. The script's
last step is a defect, not a design. It hides steps 1–3 and `scrollTo`s the
heading, its own upscroll listener undoes that, and the wheel is pinned at
y=3578 for as long as you scroll (50+ steps measured at 1440). At 834 it
jumps back 700px instead. The port releases by the sticky block ending. A
second defect surfaced only on the live CMS document: about-us's intro is
284–316px tall, so a fixed 16rem heading put it over the pinned steps. The
pin is now the measured heading height.

The matching gate had never run: `matching/SPEC.md` did not exist, so
`gate.sh` refused every page. It now runs in the cloud with
`MATCHING_SKILL_DIR` pointed at a claude-skills clone. The instrument was
proven before any of its FAILs were trusted. The live reference, proxied in
as the candidate (`matching/probes/ref-as-cand.mjs`, local), scored 0.0% in
all 33 regions on two pages; the real candidate, the same hour, failed 6 of
18 on home.

Rounds r1–r7 took home to PASS at 0.10 with no masks. Two of the
round-1-to-pass fixes were the expensive kind:

- **The font file was the wrong build.** Glyph widths differed even though
  the CSS was identical and the captured woff2 had the same md5 as ours.
  Google served the capture tool the unhinted v31 latin file; a headless
  Chromium gets the hinted one (`…Wlhyw.woff2`). "WILLIAMSON HOMES" at 300
  14px is 161px with ours and 152px with the served file, and that 6% is
  what wrapped Construction Partner's paragraph onto a fourth line at 834.
  The lesson: a captured asset is what the capture tool was served, which is
  not necessarily what a browser gets.
- **The reference has a tablet type ladder the utilities did not.** At ≤991,
  h2/h3 are 20px weight 300, and p and a are 14px (CSS:L6830, L6835). It
  showed up at 834 as 3 failing regions.

Hovers: the reference's 15 rules mostly fail AA on hover, because `a:hover`
fades everything to .8 on top of a gray tint. Secondary text on white drops
to 3.02:1, and Let's Talk to 2.91:1. Properties and transitions are the
reference's. Values are clamped only where a flat ground makes the
arithmetic possible, each clamp is computed in `src/hover-rules.test.ts`,
and the fidelity-versus-AA question is with the operator.

The census still has 17 colour/transform rows, all ACK-REQUIRED in the
LEDGER, including the reference's own invisible footer links.

What was not done:

- about-us is specced but not gated; its baseline failed every region.
- The live about-us document needs `step_height: tall` set in Prismic.
- The click IX (menu slide) and the project gallery's IX are not ported.

## 2026-10-01 — The steps become a pinned stage, and Finish Your Dream Home sticks and solidifies (#11)

The operator watched the counters port on the live preview and asked for
"Finish Your Dream Home" to stick and solidify, adding "don't worry about
matching webflow any more, just make it good"; then "same issue on about us,
we want to nail this effect, it's the main thing of interest on the site".

What was wrong with the port, measured at 1440×900 before touching it: each
`li` was its own `position: sticky`, so the four steps pinned independently
under a separately sticky heading. When step 4 arrived, step 3's ghost was
still visible beside it and step 3's circle peeked out above circle 4. Then,
the moment the last step pinned, the list ran out of track, and all four
steps slid up under the still-pinned white heading and vanished, leaving the
heading alone over an empty band. Nothing ever held on the last step.

The rewrite is one sticky stage (heading plus steps), driven by a progress
value computed from the track's scroll (`stage.ts`, pure, unit-tested).
Steps sit absolutely in one spot and rise by `rise × gap` into the circle.
Per-step scroll is 0.6 viewport (0.85 tall), with a 15% dwell at each end,
so every step reads still before the next moves. The last step gets a
0.8-viewport hold, and fills secondary → primary over the first half, with
a CSS ring that fires once on `data-solid`. The rail's length is the
distance to the last circle, so it retracts to nothing as that step
arrives.

Defects found on the way, each one visible only in a screenshot:

- `flex flex-col` on the stage made the `mx-auto` list shrink to its content
  width, which is zero when every child is absolute. Each step was measured
  at 672–828px tall, and the stage pinned 140px above the viewport. `w-full`
  fixed it.
- Centring with flex left a viewport-tall white band when the stage
  released. The stage is now its content's height, centred by its sticky
  offset.
- The bottom fade mask also clips anything above the list's top edge. The
  circles sat on that edge, so the last circle's 8% scale bump and its ring
  were sliced. The operator saw it: "there's a moment where the top of the
  last circle is clipped". The circles now sit 48px down inside the list.
- Arriving circles faded as a whole, so the rail showed through their white
  discs. The operator called it. They now keep an opaque disc and fade only
  the ink.
- The waiting step's title at 30% opacity failed `test:a11y` color-contrast
  on `/` and `/about-us`. Any partially transparent text fails, so the
  waiting step shows only its circle, and its title fades in as it rises.

Mutations M1–M9 are in the PR body. M7 survived, and the line it removed was
dead: once the last step is current, `f` is 0, so its text is already at 1.
The new clip check was proven by moving the circles back to `top-0`: 2 red.
The first run of that mutation used a `-g` filter that matched nothing and
printed nothing, which proved nothing, so it was rerun unfiltered.

The matching gate was not re-run for this section, by the operator's call;
`matching/LEDGER.md` says so, and marks the older counters entries as
describing the removed port.

## 2026-10-04 — About Us matched: 19 of 21 gate regions pass; the two left are the reference's own phone defects (PR to follow)

The operator, after the steps stage: "about us and projects should be
matched, my comment was for the homepage and the steps specifically". About
Us had been specced but never gated; its 10-01 baseline failed every region.

The first thing the gate had to be taught was where About Us's sections are.
Below 480 the reference hides its desktop timeline and steps sections and
shows later phone-only twins, and page-diff resolves an anchor to the first
element in document order whether it is visible or not, so every anchor in
those sections cut at y=0. `matching/gate-about.sh` is gate.sh's own call
plus one disclosed `--pin-state` that removes `display:none` sections, which
changes no pixel. "Collaborative approach" also first matched circle 3's label
near the top of the page, so the steps are cut at their first title, and the
title's screen-reader "Step 1:" moved into an `aria-label` so the visible text
can be an anchor. An earlier draft of this simply deleted the prefix; a test
written for exactly that prefix went red, and it was right.

What was different, by section, each read from the reference's source:

- The hero is an `<img>` pinned bottom-left at full width (sand and walkers
  in frame), under 8rem of top space, not home's 12rem and centred cover.
  Heroes differ per page (home, about, contact/projects), so PageHero took
  three optional fields with defaults that leave every other page alone.
- The timeline was the wrong layout, not the wrong spacing: the reference
  puts text and photo on opposite sides of the line, alternating, in fixed
  32rem rows. Rebuilt; photos at natural size. That last part needed the dev
  surface to stop claiming every image is 1600×1067; it now reads the
  captured file's real size, as Prismic does in production.
- The family statement and closing CTA are spaced per page (home's CTA 0/8rem,
  about's 8rem/8rem), so Statement took two spacing fields. The W mark is not
  black but tan, from a filter chain in About Us's own page `<style>`, and the
  same block centres the last timeline circle, overriding the shared
  stylesheet's 49%. Contact's mark is blue at 8rem; `mark_style` covers it.
- Commercial Advantage is a flush panel (80px inside) with Webflow row
  gutters, which is where 444×250 photos come from; ours had 32px gaps and
  246px photos.

The single most useful discovery: page-diff renders with reduced motion. The
gate never sees the pinned stage on About Us, it sees the plain list, so that
list can and now does match the reference's resting layout (its 16rem
header, which #11 dropped, and the phone column at x=34).

Two regions fail and are left for the operator, both at 390 and both
reference defects: the family heading is `width: 620px` and runs off a phone
screen (ours wraps), and the phone steps twin drops the intro paragraph and is
headed "A Family of Builders", copied from the section above (ours keeps
"Collaborative approach" and its intro). Copying either makes the page worse.

Home was re-gated after the shared changes: still 18 of 18. Census over both
pages is clean with every declaration ledgered; one is "email us" at #939393,
3.0:1 on white, kept at our AA colour under the operator's "accessibility
wins".

Not done here: the live Prismic documents need the new field values (about,
home's CTA, contact's mark), which is a release for the operator to publish
after the models land.

## 2026-10-04 — Projects and the project template matched: both gates pass at all three widths (PR to follow)

The projects index was a three-column card grid; the reference is one column
of 60% squares that alternate sides, with the title as an eyebrow at the
photo's bottom edge, and a hero that puts the heading above the W. PageHero
took a `layout` field for that, and ProjectList was rebuilt. At 1440 the index
then matched to the pixel: hero 695, cards 633 apart, CTA anchor at 4656.

The template's gallery was already the right size photo for photo. What
failed was smaller and spread across the page. The credit line was 24px where
the reference's is 32px with 10px under it, and that 10px collapsed into the
gallery's margin until the block was made `flow-root`. The gallery ended 8rem
under the last photo, not 4rem. The 390 region still failed at 19% after
those fixes, and the cause was a 1px transparent left border the reference's
`.px-4` carries below 480. It makes every photo 357px wide, not 358, and
across 14 photos that is 18px of drift. The rule was already copied once, in
Timeline, and nobody had generalised it.

The footer has been 16px too tall on every page since the build: its links
sat in 24px list rows, where the reference's are block links at 20px. Home
and About Us were re-gated after the change, unchanged at 18/18 and 19/21.

One correction to the instrument. The project page's "Home" anchor never
measured what it claimed. page-diff resolves anchors over a fixed tag list
that includes `section` and not `footer`, so it cut the reference at its
footer section and ours at the first link inside, 128px lower. Every footer
region read an 18–21% height delta from the cut alone. The anchor is gone and
the reasoning is in the LEDGER.

The census caught the last one: the project title was a fixed 22px where the
reference steps down to 20 and 16. Nine mutations, one per change, each turn
a test red.

The gates ran on the seed. Production /projects keeps the W first until the
PageHero model is pushed (on merge) and a Prismic release sets the projects
hero to `heading-first` with 8rem/4rem and its CTA to 8rem/8rem.

Content found on the way: three projects had a "Design: …" line from a
Webflow field the migration dropped. The seed has it now; the live documents
need a Prismic release. The reference spells the designer "Christien" on one
page and "Christine" on two, and that is the operator's call.

## 2026-10-04 — Contact matched: everything but the deliberate hero teal passes (PR to follow)

The contact headshots were a two-photo grid. The reference is a small
timeline: two columns share a centre line, with Brian at the top right and
Mark 24rem lower on the left, each photo centred on the line and a circle
capping it. On phones each person gets their own side line instead. With
TeamContacts rebuilt to those measurements, the region passed on its first
gate run at all three widths. The hero was 64px too tall (8rem bottom against
4rem), and the closing statement had 8rem above a section that, in the
reference, starts at the W.

The hero still fails, and on purpose. Its ground is the darker teal chosen in
September for contrast: white on the reference's #77b9bc is about 2.3:1. To
show that the colour is the entire failure and not a cover for geometry, a
diagnostic run painted our hero the reference teal and read 0.0%, 0.0% and
1.1%. That run is disclosed and kept out of the gate results.

The census found the one thing the pixels did not: the email and phone links
are 14px and 16px in the reference, not the paragraph's 17px. Eight
mutations, each turning a test red.

Contact was the last unmatched page. Every page and the project template now
has a gate; the failures left are the hero teal here and About Us's two phone
defects, and all three are the reference's own problems.

## 2026-10-04 — Off Slice Machine, onto the Prismic CLI (reddoor-maintenance#1090, `claude/prismic-cli`)

Phase 4 of the fleet migration, after williamson-construction-co, which shares
this template. Slice Machine is deprecated by Prismic since 2026-09-18; models
are now edited in the Type Builder, and the generated files come from
`pnpm prismic:gen`. `prismic.config.json` replaces `slicemachine.config.json`
in the five places that read it (svelte.config.js, `$lib/prismicio`,
`scripts/csp-policy.test.ts`, `tests/smoke/routes.ts`, `.env.example`), and
the nine relative imports of the types file follow it to the project root
(one more than on construction: `$lib/header-tone`). Those imports already
name the file by path, so svelte-check keeps its `@prismicio/client`
augmentation without an `app.d.ts` import: 0 errors before and after.
`slice-machine-ui`, the adapter and `concurrently` are gone, `pnpm dev` is
plain `vite dev --host`, and the lockfile lost 2,366 lines. No matching file
and no LEDGER line was touched.

**No stale model.** The regenerated types export the same 80 names as the
Slice Machine file, and the slice index maps the same 20 components; the only
differences are the generator's own formatting.

**The simulator could not be framed, for the same reason as on
construction.** The root layout's `prerender = "auto"` built
`/slice-simulator` to a static file, so Netlify served it with netlify.toml's
`/*` `X-Frame-Options: SAMEORIGIN` and only a `<meta>` CSP, which cannot carry
`frame-ancestors`. Read live on `williamson-homes.netlify.app` at 22:47Z:
`/slice-simulator`, `/` and `/health` all answer `SAMEORIGIN`.
(`www.williamson-homes.com` is still the old site behind Cloudflare, so the
Type Builder's simulator URL belongs on the netlify.app host for now.) The
route is now `prerender = false`, and the hook, on that path only, drops
X-Frame-Options and widens the CSP to
`frame-ancestors 'self' http://localhost:* https://*.prismic.io https://prismic.io`.
From `vite preview`, before and after: `/` and `/about-us` are static with
neither header both times, `/health` sends `SAMEORIGIN` both times, and
`/slice-simulator` went from a static file with neither header to a 200 with
the widened policy and no X-Frame-Options. Prerendered HTML went from 11 files
to 10. As on construction, that Netlify's static header stays off a function
response cannot be told apart here from the hook's own SAMEORIGIN on other
routes; the deploy preview is where to read it.

**The ported tests had two holes, and mutations found both.** Construction's
`hooks.server.test.ts` only ever hands the hook a response without
X-Frame-Options, so deleting the hook's `headers.delete("X-Frame-Options")`
passed every test; a test now feeds it an upstream `DENY` and expects none.
And the framers were asserted against `CMS_FRAME_ANCESTORS` itself, so
narrowing that constant (dropping `https://*.prismic.io`) also passed; a test
now spells the directive out. After both, every mutation went red:
`prerender = true` (1), the delete removed (1), `widenFrameAncestors` skipped
(1), SAMEORIGIN set after the framed branch (3), the route renamed (4), the
framers narrowed (1), SAMEORIGIN dropped from ordinary pages (1), the
trailing-slash normalisation removed (1). One first-attempt mutation, setting
SAMEORIGIN before the framed branch, was equivalent: the branch deletes it
again. svelte.config.js pointed back at the deleted config fails to load
(ENOENT). The codegen gate went red when a field was added to Hero's model
without regenerating, green on the committed tree.

**Prismic agrees with the repo, after one normalisation.** This site is not in
the nightly drift log, so the 3 custom types and 20 slices were read through
the Prismic connector and compared field by field (type and config;
slice-zone choices by key). The first run reported two differences: Hero's
`cta_link` and SectionGrid's `item_link` omit `select` locally, and Prismic
returns `select: null`. That is Prismic's codec, not drift:
`@prismicio/types-internal`'s `LinkConfig` decodes an absent `select` with
`withFallback(..., null)`. With only that key normalised, 0 differences. The
comparison was shown to fail on five deliberate local edits (a dropped Select
option, a renamed slice choice, a changed label, a Link `select` set to
`document`, a field's type changed), each reported once, then restored.

## 2026-10-04 — The simulator leaves every public page's bundle; an encoded path gets the simulator's framing (`fix/simulator-chunk-and-encoded-framing`)

Ported from reddoor-starter#168, following caltex-landing#70 and vida-legacy-foundation#90; the starter's entry records the bundle fixes that failed before this one. `/slice-simulator` imports `SliceSimulator` from the `@prismicio/svelte` barrel, which re-exports it statically, so Rolldown put the simulator into the barrel's shared chunk (`DUcuEciQ.js` on `main`), and every node that renders a `SliceZone` loaded it. `scripts/prismic-barrel.ts`, identical to the starter's, declares that re-export-only module side-effect-free, and `SliceZone` is then bound directly.

Measured from the build manifest as each client node's static-import closure, gzipped, `main` → branch: home and `[uid]` went 64,841 → 60,458, `projects/[uid]` 35,001 → 30,235, `/dev/a11y-fixtures` 56,849 → 52,143 and `/dev/match/[uid]` 66,097 → 61,716. Each reached the simulator chunk before, and none does after. `/slice-simulator` went 64,874 → 65,036 and carries the code in its own node. The root layout (45,675) never reached it.

The hook asked `isCmsFramedRoute(event.url.pathname)`, the raw path, while SvelteKit routes on the decoded one. From `vite preview` of `main`, `/slice%2Dsimulator` and `/slice%2dsimulator` rendered the simulator with `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`. That failed closed, but it was the wrong route test. The hook now asks `event.route.id`, and both encoded paths answer like `/slice-simulator`.

All nine existing hook tests stay, each event now carrying a route id. The trailing-slash test became the exact-match test, because a route id has no trailing slash to forgive. The encoded-path, null-route and route-exists tests are new. The bundle check lives in vitest as `scripts/prismic-barrel.test.ts`, so the smoke spec carries only the framing tests. Against a `main` build, with the plugin file present but unregistered so that the test file could import it, vitest failed 4 of 20 (the bundle check, the encoded path, the null route and the exact match), and the smoke spec failed 2 of 4 (both encoded paths). On the branch, everything passes. With the plugin removed and the site rebuilt, the bundle check fails on home's node. With the hook back on the pathname, the encoded-path and null-route tests fail. With the hook's `X-Frame-Options` delete removed, the upstream-header test fails, so it still bites under route ids.

## 2026-10-05 — Tests build; they don't freeze: the matching-era pins leave the gate (#36)

On 2026-10-01 the operator ended matching: "don't worry about matching webflow any more, just make it good". The tests written during the match still gated every PR, so the edits that instruction invited would each have turned `ci / ci` red: hero padding, a hover opacity, header timing, a step gap. The model is reddoorla/roalson-interests#256, which the native template now ships as reddoor-starter#180.

**What a red now means.**

- **The gate.** 22 of 41 Playwright tests are tagged `@smoke`: every route plus the 404, slice-simulator, the a11y fixtures, landscape, the no-JS reveal, the reduced-motion steps stage, and a new menu focus-return test. vitest has had its pins removed:
  - `page-spacing.test.ts`, about 90% Tailwind classes, is deleted. Its contract checks moved into `site-slices.test.ts`: hero order by `layout`, the step aria-label rule, `mailto:`/`tel:` containment, and non-overlapping team rows.
  - ProcessSteps now asserts relations derived from `stageLengths` instead of 240/200/360px.
  - SiteHeader asserts `inert` and `data-hero-out` instead of `-translate-y-[152px]`.
  - Link lists became containment checks.
- **Nightly.** `test:nightly` and `nightly.yml` run the steps stage, the menu and gallery motion and the reveal trace, and block nothing.
- **Scaffold.** `test:scaffold` holds the rest.

The pre-commit prettier hook from reddoor-starter#169 is in too. `matching/` is untouched; whether to add `matching/PAUSED` is the operator's call.

**Measured.** On `main` the full suite was 40 Playwright tests in 3.6 min locally, with 3 red under load: the reveal-trace timeout and two steps-stage counts. `ci / ci` on this branch passed in 2 min 20 s. Locally, lint and svelte-check are clean and vitest passes 639.

**Found and filed.**

- #22: PageHero `text_tone: dark` on a solid ground renders at 1.00:1.
- #30: Let's Talk sits on a photo with no scrim.
- #31: the contrast tests measure an ancestor's colour.
- #32: hover-rules rejects measurable arbitrary values.
- #33: prove the two rewritten `@smoke` tests in a browser.
- #34: the nav drops to 3.57:1 on hover over the teal hero.

#35, a stale comment citing a deleted pin, is fixed here.

## 2026-10-05 — The freeze round: designer edits stay green, real bugs go red, and two gate gaps closed (#36)

The tiers entry above claimed the gate no longer freezes design. This entry is that claim tested. Each edit below was made to the site source, run through the whole gate (vitest and the `@smoke` tier), and then reverted.

**Designer edits.** Four were applied together:

- the footer link hover opacity moved from .87 to .9;
- the home hero padding changed from `pt-48` to `pt-56`;
- `MENU_SLIDE_MS` changed from 500 to 250;
- the desktop step gap changed from 240 to 260.

On main they turned 10 tests red: 9 in vitest (hover-rules 1, page-spacing 1, ProcessSteps 7) and the Playwright menu-offset test. On this branch the gate stayed green: vitest 639, `@smoke` 23/23.

**Real bugs.** Two of the three were invisible to the gate before this entry:

- **The phone menu could lose `onEscape`.** No test pressed Escape on SiteHeader's menu; the template's Nav tests cover a different component. The `@smoke` "opens as a named dialog" test now reopens the menu and presses Escape. It expects the dialog hidden and focus back on "Open menu", which is what `trapFocus` does through `closeMenu`.
- **The header Contact link could point at `/contact-us` (a 404).** Nothing followed header or footer hrefs. A new `@smoke` spec, `tests/smoke/chrome-links.spec.ts`, collects every same-origin href in the header, the sticky bar and the footer and requires a 200 for each. It is guarded against passing with zero links.
- **Footer hover opacity at .8 (below AA)** was already red in hover-rules before this entry.

Each new test was proven green on the clean tree and red under its bug.

**One `@smoke` read raced.** "no pinning, every step's text visible" read the step opacities just after toggling motion back to reduce. During the un-pin, a step's inline opacity can still be 0 for a frame. It went red once under load and then passed when run alone. It now reads the page a reduced-motion visitor loads, before the control toggle, and passed 5/5 on repeat. Forcing the step body to opacity 0 under reduced motion turns it red, so the check is not vacuous.
