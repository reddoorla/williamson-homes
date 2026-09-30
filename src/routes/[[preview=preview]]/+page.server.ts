import { error } from "@sveltejs/kit";

import { headerToneFor } from "$lib/header-tone";
import { loadPage } from "$lib/page-load";
import { createClient, isPlaceholderRepo } from "$lib/prismicio";
import { loadProjectCards } from "$lib/projects";

export async function load({ fetch, cookies }) {
  if (isPlaceholderRepo) error(404, { message: "Page not found" });

  const client = createClient({ fetch, cookies });
  const [loaded, projects] = await Promise.all([
    loadPage(client, "home"),
    loadProjectCards(client),
  ]);
  return { ...loaded, projects, headerTone: headerToneFor(loaded.page) };
}

export function entries() {
  return isPlaceholderRepo ? [] : [{}];
}
