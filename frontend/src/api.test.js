import { describe, expect, it } from "vitest";
import { unwrapUserServiceResponse } from "./api.js";

describe("unwrapUserServiceResponse", () => {
  it("extracts QueryResponse.data", () => {
    expect(unwrapUserServiceResponse({ data: { id: 7, username: "a" } })).toEqual({ id: 7, username: "a" });
  });
  it("returns payload as-is when not wrapped", () => {
    expect(unwrapUserServiceResponse({ id: 1 })).toEqual({ id: 1 });
  });
  it("handles null data", () => {
    expect(unwrapUserServiceResponse({ data: null })).toBeNull();
  });
});
