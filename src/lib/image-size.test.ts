import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { imageSize } from "./image-size";

const png = (w: number, h: number) => {
  const b = new Uint8Array(24);
  const v = new DataView(b.buffer);
  v.setUint32(0, 0x89504e47);
  v.setUint32(4, 0x0d0a1a0a);
  v.setUint32(8, 13);
  v.setUint32(12, 0x49484452);
  v.setUint32(16, w);
  v.setUint32(20, h);
  return b;
};

const jpeg = (w: number, h: number) =>
  new Uint8Array([
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    h >> 8,
    h & 255,
    w >> 8,
    w & 255,
    0x03,
    0,
    0,
    0,
    0,
    0,
    0,
  ]);

describe("imageSize", () => {
  it("reads a PNG's IHDR", () => {
    expect(imageSize(png(333, 251))).toEqual({ width: 333, height: 251 });
  });

  it("reads a JPEG's frame header past an APP0 segment", () => {
    expect(imageSize(jpeg(1600, 1067))).toEqual({ width: 1600, height: 1067 });
  });

  it("returns null for anything else", () => {
    expect(imageSize(new TextEncoder().encode("<svg></svg>"))).toBeNull();
    expect(imageSize(new Uint8Array(3))).toBeNull();
  });

  it("matches the reference's natural size for the captured timeline photo", () => {
    const file = (readdirSync("matching/spec/files", { recursive: true }) as string[]).find((f) =>
      f.endsWith("williamson-old-timey.png"),
    );
    if (!file) return;
    expect(imageSize(readFileSync(`matching/spec/files/${file}`))).toEqual({
      width: 333,
      height: 333,
    });
  });
});
