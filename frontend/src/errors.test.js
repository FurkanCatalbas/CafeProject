import { describe, expect, it } from "vitest";
import { hataMesaji, normalizeRegisterType, parseUserIdQuery, safeInt } from "./errors.js";

describe("safeInt", () => {
  it("uses fallback for empty or non-numeric input", () => {
    expect(safeInt("", 1)).toBe(1);
    expect(safeInt(undefined, 2)).toBe(2);
    expect(safeInt(null, 3)).toBe(3);
    expect(safeInt("x", 9)).toBe(9);
  });
  it("truncates valid numbers", () => {
    expect(safeInt("42", 0)).toBe(42);
    expect(safeInt(3.7, 0)).toBe(3);
  });
});

describe("normalizeRegisterType", () => {
  it("defaults empty to 1", () => {
    expect(normalizeRegisterType("")).toBe(1);
    expect(normalizeRegisterType(null)).toBe(1);
  });
  it("floors non-negative numbers", () => {
    expect(normalizeRegisterType(2)).toBe(2);
    expect(normalizeRegisterType("0")).toBe(0);
  });
});

describe("parseUserIdQuery", () => {
  it("rejects invalid ids", () => {
    expect(parseUserIdQuery("").ok).toBe(false);
    expect(parseUserIdQuery("abc").ok).toBe(false);
    expect(parseUserIdQuery("1.2").ok).toBe(false);
    expect(parseUserIdQuery("-1").ok).toBe(false);
  });
  it("accepts positive integers", () => {
    expect(parseUserIdQuery(" 7 ").ok).toBe(true);
    expect(parseUserIdQuery("7").value).toBe(7);
  });
});

describe("hataMesaji", () => {
  it("strips VALIDATION prefix", () => {
    expect(hataMesaji(new Error("VALIDATION:Test mesajı."))).toBe("Test mesajı.");
  });
  it("maps HTTP status", () => {
    const e401 = new Error("x");
    e401.status = 401;
    expect(hataMesaji(e401)).toMatch(/Oturum/);
    const e404 = new Error("Request failed with 404");
    e404.status = 404;
    expect(hataMesaji(e404)).toMatch(/kayıt bulunamadı/);
  });
});
