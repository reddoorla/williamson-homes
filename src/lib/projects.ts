import { error } from "@sveltejs/kit";
import {
  NotFoundError,
  RepositoryNotFoundError,
  isFilled,
  type ContentRelationshipField,
  type ImageField,
} from "@prismicio/client";

import type { ProjectDocument } from "../../prismicio-types";

export type ProjectCard = {
  id: string;
  uid: string;
  title: string;
  image: ImageField;
};

export type ProjectContext = { projects?: ProjectCard[] };

export type ProjectClient = {
  getByUID(type: "project", uid: string): Promise<ProjectDocument>;
  getAllByType(type: "project"): Promise<ProjectDocument[]>;
};

export const projectHref = (uid: string) => `/projects/${uid}`;

export function toCard(doc: ProjectDocument): ProjectCard {
  return {
    id: doc.id,
    uid: doc.uid,
    title: doc.data.title ?? doc.uid,
    image: doc.data.hero_image,
  };
}

export async function loadProjectCards(client: ProjectClient): Promise<ProjectCard[]> {
  return (await client.getAllByType("project")).map(toCard);
}

export function pickProjects(
  items: ReadonlyArray<{ project: ContentRelationshipField<"project"> }>,
  all: ReadonlyArray<ProjectCard>,
  { fallbackToAll = false }: { fallbackToAll?: boolean } = {},
): ProjectCard[] {
  const byId = new Map(all.map((card) => [card.id, card]));
  const picked: ProjectCard[] = [];
  const seen = new Set<string>();
  for (const { project } of items) {
    if (!isFilled.contentRelationship(project) || project.isBroken) continue;
    const card = byId.get(project.id);
    if (!card || seen.has(card.id)) continue;
    seen.add(card.id);
    picked.push(card);
  }
  if (picked.length === 0 && fallbackToAll) return [...all];
  return picked;
}

export function projectMeta(project: ProjectDocument) {
  return {
    title: project.data.title ?? project.uid,
    meta_title: project.data.meta_title,
    meta_description: project.data.meta_description,
    meta_image: project.data.meta_image?.url ?? project.data.hero_image?.url ?? undefined,
    meta_image_alt: project.data.meta_image?.alt ?? undefined,
    headerTone: "light" as const,
  };
}

export async function loadProject(client: ProjectClient, uid: string) {
  try {
    const project = await client.getByUID("project", uid);
    return { project, ...projectMeta(project) };
  } catch (err) {
    if (err instanceof NotFoundError && !(err instanceof RepositoryNotFoundError)) {
      error(404, { message: "Project not found" });
    }
    throw err;
  }
}
