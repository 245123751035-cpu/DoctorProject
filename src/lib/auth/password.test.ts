import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes passwords and never stores plaintext", async () => {
    const hash = await hashPassword("SuperSecret123");
    expect(hash).not.toContain("SuperSecret123");
    expect(hash).toMatch(/^\$2/);
  });

  it("verifies correct and rejects incorrect passwords", async () => {
    const hash = await hashPassword("CorrectPass123");
    expect(await verifyPassword("CorrectPass123", hash)).toBe(true);
    expect(await verifyPassword("WrongPass123", hash)).toBe(false);
  });

  it("produces unique hashes for the same password", async () => {
    const h1 = await hashPassword("SamePass123");
    const h2 = await hashPassword("SamePass123");
    expect(h1).not.toBe(h2);
  });
});
