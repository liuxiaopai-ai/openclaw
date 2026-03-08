import { describe, expect, it } from "vitest";
import { sanitizeEnvVars } from "./sanitize-env-vars.js";

describe("sanitizeEnvVars", () => {
  it("keeps normal env vars and blocks obvious credentials", () => {
    const result = sanitizeEnvVars({
      NODE_ENV: "test",
      OPENAI_API_KEY: "sk-live-xxx", // pragma: allowlist secret
      FOO: "bar",
      GITHUB_TOKEN: "gh-token", // pragma: allowlist secret
    });

    expect(result.allowed).toEqual({
      NODE_ENV: "test",
      FOO: "bar",
    });
    expect(result.blocked).toEqual(expect.arrayContaining(["OPENAI_API_KEY", "GITHUB_TOKEN"]));
  });

  it("blocks credentials even when suffix pattern matches", () => {
    const result = sanitizeEnvVars({
      MY_TOKEN: "abc",
      MY_SECRET: "def",
      USER: "alice",
    });

    expect(result.allowed).toEqual({ USER: "alice" });
    expect(result.blocked).toEqual(expect.arrayContaining(["MY_TOKEN", "MY_SECRET"]));
  });

  it("does not warn for long alphanumeric-only values", () => {
    const alphanumericOnly = "A".repeat(132);
    const result = sanitizeEnvVars({
      USER: "alice",
      SAFE_TEXT: alphanumericOnly,
    });

    expect(result.allowed).toEqual({ USER: "alice", SAFE_TEXT: alphanumericOnly });
    expect(result.warnings).toEqual([]);
  });

  it("adds warnings for padded base64-like values", () => {
    const base64Like = Buffer.alloc(97, 0xff).toString("base64");
    const result = sanitizeEnvVars({
      USER: "alice",
      SAFE_TEXT: base64Like,
    });

    expect(result.allowed).toEqual({ USER: "alice", SAFE_TEXT: base64Like });
    expect(result.warnings).toContain("SAFE_TEXT: Value looks like base64-encoded credential data");
  });

  it("blocks null-byte values even when warnings are otherwise empty", () => {
    const result = sanitizeEnvVars({
      USER: "alice",
      NULL: "a\0b",
    });

    expect(result.allowed).toEqual({ USER: "alice" });
    expect(result.blocked).toContain("NULL");
  });

  it("supports strict mode with explicit allowlist", () => {
    const result = sanitizeEnvVars(
      {
        NODE_ENV: "test",
        FOO: "bar",
      },
      { strictMode: true },
    );

    expect(result.allowed).toEqual({ NODE_ENV: "test" });
    expect(result.blocked).toEqual(["FOO"]);
  });
});
