import { error, redirect } from "@sveltejs/kit";

import { headerToneFor } from "$lib/header-tone";
import { loadPage } from "$lib/page-load";
import { createClient, isPlaceholderRepo } from "$lib/prismicio";
import { loadProjectCards } from "$lib/projects";

export async function load({ params, fetch, cookies }) {
  if (params.uid === "home") redirect(308, "/");

  if (isPlaceholderRepo) error(404, { message: "Page not found" });

  const client = createClient({ fetch, cookies });
  const [loaded, projects] = await Promise.all([
    loadPage(client, params.uid),
    loadProjectCards(client),
  ]);
  return { ...loaded, projects, headerTone: headerToneFor(loaded.page) };
}

export async function entries() {
  if (isPlaceholderRepo) return [];

  const pages = await createClient().getAllByType("page");
  return pages.filter((page) => page.uid !== "home").map((page) => ({ uid: page.uid }));
}
