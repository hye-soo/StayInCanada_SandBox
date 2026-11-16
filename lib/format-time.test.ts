import { test } from "node:test";
import assert from "node:assert/strict";
import { formatFeedTime, formatTimeAgo } from "./format-time.ts";

const NOW = Date.UTC(2026, 10, 12, 12, 0, 0);
const MIN = 60_000;

test("formats elapsed time in the largest whole unit", () => {
  assert.equal(formatTimeAgo(NOW - 20_000, NOW), "Just now");
  assert.equal(formatTimeAgo(NOW - 30 * MIN, NOW), "30m ago");
  assert.equal(formatTimeAgo(NOW - 3 * 60 * MIN, NOW), "3h ago");
  assert.equal(formatTimeAgo(NOW - 26 * 60 * MIN, NOW), "1d ago");
});

test("feed times read Today / Yesterday / date, with the time", () => {
  const now = new Date(2026, 10, 15, 18, 0).getTime();
  assert.equal(formatFeedTime(new Date(2026, 10, 15, 9, 30).getTime(), now), "Today, 9:30 AM");
  assert.equal(formatFeedTime(new Date(2026, 10, 14, 15, 10).getTime(), now), "Yesterday, 3:10 PM");
  assert.equal(formatFeedTime(new Date(2026, 10, 2, 11, 20).getTime(), now), "Nov 2, 11:20 AM");
});
