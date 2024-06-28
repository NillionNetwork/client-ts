import { initNillion } from "./index";

test("thing", async () => {
  console.log("hi");
  await initNillion();
});

test("another thing", async () => {
  expect(1).toBeGreaterThan(0);
});
