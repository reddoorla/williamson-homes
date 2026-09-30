import { error } from "@sveltejs/kit";

import { createClient, isPlaceholderRepo } from "$lib/prismicio";
import { loadProject } from "$lib/projects";

export async function load({ params, fetch, cookies }) {
  if (isPlaceholderRepo) error(404, { message: "Project not found" });

  return loadProject(createClient({ fetch, cookies }), params.uid);
}

export async function entries() {
  if (isPlaceholderRepo) return [];

  const projects = await createClient().getAllByType("project");
  return projects.map((project) => ({ uid: project.uid }));
}
