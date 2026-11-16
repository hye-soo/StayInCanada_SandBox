import { test } from "node:test";
import assert from "node:assert/strict";
import { getUploadedFileStore } from "./uploaded-file-store.ts";

test("uploaded files are kept per client and document, latest wins", () => {
  const store = getUploadedFileStore();
  assert.equal(store.get("uid-f-1", "passport"), undefined);
  store.save("uid-f-1", "passport", { name: "a.pdf", bytes: new Uint8Array([1]) });
  store.save("uid-f-1", "passport", { name: "b.pdf", bytes: new Uint8Array([2]) });
  assert.equal(store.get("uid-f-1", "passport")?.name, "b.pdf");
  assert.equal(store.get("uid-f-2", "passport"), undefined);
});
