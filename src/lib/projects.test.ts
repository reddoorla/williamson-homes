import { describe, expect, it } from "vitest";
import { NotFoundError, RepositoryNotFoundError } from "@prismicio/client";
import { isHttpError } from "@sveltejs/kit";

import { loadProject, pickProjects, projectHref, toCard, type ProjectCard } from "./projects";
import type { ProjectDocument } from "../prismicio-types";

const doc = (uid: string, title: string | null = uid) =>
  ({
    id: `id-${uid}`,
    uid,
    type: "project",
    data: {
      title,
      hero_image: { url: `https://images.prismic.io/x/${uid}.jpg`, alt: null },
      credits: [],
      gallery: [],
      meta_title: null,
      meta_description: null,
      meta_image: {},
    },
  }) as unknown as ProjectDocument;

const rel = (id: string, isBroken = false) => ({
  project: { link_type: "Document", id, type: "project", uid: id, isBroken } as never,
});

const cards: ProjectCard[] = ["a", "b", "c"].map((uid) => toCard(doc(uid)));

const clientFor = (impl: (uid: string) => Promise<ProjectDocument>) => ({
  getByUID: (_type: "project", uid: string) => impl(uid),
  getAllByType: async () => [],
});

async function statusOf(promise: Promise<unknown>): Promise<number | "resolved"> {
  try {
    await promise;
    return "resolved";
  } catch (err) {
    if (isHttpError(err)) return err.status;
    throw err;
  }
}

describe("loadProject", () => {
  it("answers an unknown slug with a 404, not a 200 or a 500", async () => {
    const client = clientFor(async () => {
      throw new NotFoundError("No documents were returned", "https://x", undefined);
    });
    expect(await statusOf(loadProject(client, "no-such-project"))).toBe(404);
  });

  it("keeps a wrong repository name loud instead of calling it a missing project", async () => {
    const client = clientFor(async () => {
      throw new RepositoryNotFoundError("Repository not found", "https://x", undefined);
    });
    await expect(loadProject(client, "palos-verdes-cove")).rejects.toBeInstanceOf(
      RepositoryNotFoundError,
    );
  });

  it("rethrows an outage", async () => {
    const client = clientFor(async () => {
      throw new Error("ECONNRESET");
    });
    await expect(loadProject(client, "palos-verdes-cove")).rejects.toThrow("ECONNRESET");
  });

  it("prefers the SEO image over the hero for the share card", async () => {
    const client = clientFor(async (uid) => {
      const project = doc(uid, "Palos Verdes Cove");
      (project.data as { meta_image: unknown }).meta_image = {
        url: "https://images.prismic.io/x/share-card.jpg",
        alt: "Share card",
      };
      return project;
    });
    const result = await loadProject(client, "palos-verdes-cove");
    expect(result.meta_image).toBe("https://images.prismic.io/x/share-card.jpg");
    expect(result.meta_image_alt).toBe("Share card");
  });

  it("returns the document and its head payload for a known slug", async () => {
    const client = clientFor(async (uid) => doc(uid, "Palos Verdes Cove"));
    const result = await loadProject(client, "palos-verdes-cove");
    expect(result.project.uid).toBe("palos-verdes-cove");
    expect(result.title).toBe("Palos Verdes Cove");
    expect(result.meta_image).toBe("https://images.prismic.io/x/palos-verdes-cove.jpg");
    expect(result.headerTone).toBe("light");
  });
});

describe("pickProjects", () => {
  it("keeps the editor's order", () => {
    expect(pickProjects([rel("id-c"), rel("id-a")], cards).map((c) => c.uid)).toEqual(["c", "a"]);
  });

  it("drops broken, unknown and repeated links", () => {
    const picked = pickProjects(
      [rel("id-a"), rel("id-b", true), rel("id-zzz"), rel("id-a")],
      cards,
    );
    expect(picked.map((c) => c.uid)).toEqual(["a"]);
  });

  it("lists every project when asked to fall back and nothing is chosen", () => {
    expect(pickProjects([], cards, { fallbackToAll: true }).map((c) => c.uid)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("does not fall back unless asked", () => {
    expect(pickProjects([], cards)).toEqual([]);
  });
});

describe("projectHref and toCard", () => {
  it("routes a project under /projects", () => {
    expect(projectHref("hermosa-home-gym")).toBe("/projects/hermosa-home-gym");
  });

  it("falls back to the uid when a project has no title", () => {
    expect(toCard(doc("untitled", null)).title).toBe("untitled");
  });
});
