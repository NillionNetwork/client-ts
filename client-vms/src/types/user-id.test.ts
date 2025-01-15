import { describe, expect, it } from "vitest";
import { UserId } from "#/types/user-id";

describe("UserId", () => {
  it("can create a user id from a hex string", () => {
    const hex = "0123456789abcdef08090a0b0c0d0e0f10111213";
    const userId = UserId.fromHex(hex);
    expect(userId.toHex()).toEqual(hex);
  });
});
