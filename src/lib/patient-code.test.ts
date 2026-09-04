import { describe, it, expect, vi } from "vitest";
import {
  generatePatientCode,
  normalizePatientCode,
  isValidPatientCodeFormat
} from "@/lib/patient-code";

describe("generatePatientCode", () => {
  it("produces a code matching the XX-1234 format", () => {
    for (let i = 0; i < 100; i++) {
      const code = generatePatientCode();
      expect(code).toMatch(/^[A-Z]{2}-\d{4}$/);
    }
  });

  it("is not sequential and randomizes the numeric component", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 200; i++) {
      codes.add(generatePatientCode());
    }
    expect(codes.size).toBeGreaterThan(150);
  });
});

describe("normalizePatientCode", () => {
  it("normalizes lowercase and whitespace to uppercase", () => {
    expect(normalizePatientCode("  mx-6660 ")).toBe("MX-6660");
    expect(normalizePatientCode("ph-1234")).toBe("PH-1234");
  });
});

describe("isValidPatientCodeFormat", () => {
  it("accepts valid codes", () => {
    expect(isValidPatientCodeFormat("MX-6660")).toBe(true);
    expect(isValidPatientCodeFormat("  AB-1234 ")).toBe(true);
  });

  it("rejects invalid codes", () => {
    expect(isValidPatientCodeFormat("MX6660")).toBe(false);
    expect(isValidPatientCodeFormat("M-6660")).toBe(false);
    expect(isValidPatientCodeFormat("1234")).toBe(false);
    expect(isValidPatientCodeFormat("")).toBe(false);
  });
});
