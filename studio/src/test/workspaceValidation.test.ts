import assert from "node:assert/strict";
import { defineSuite, defineTest } from "./harness";
import { formatWorkspaceCorrespondenceError, validateJsonMarkdownCorrespondence } from "../workspace/validation";

export const workspaceValidationSuite = defineSuite("workspace validation", [
  defineTest("accepts an exact one-to-one JSON key and Markdown stem match", () => {
    assert.deepEqual(
      validateJsonMarkdownCorrespondence({ Set: {}, Group: {} }, ["Group.md", "Set.md"]),
      { ok: true },
    );
  }),
  defineTest("accepts spaces in JSON keys as underscores in Markdown filenames", () => {
    assert.deepEqual(
      validateJsonMarkdownCorrespondence({ "Vector Space": {}, Inner_Product: {} }, ["Vector_Space.md", "Inner_Product.md"]),
      { ok: true },
    );
  }),
  defineTest("reports mismatches in both directions", () => {
    const result = validateJsonMarkdownCorrespondence(
      { Set: {}, Missing_Note: {} },
      ["Set.md", "Category.md"],
    );
    if (result.ok) {
      assert.fail("Expected correspondence validation to fail.");
    }
    assert.equal(
      formatWorkspaceCorrespondenceError(result),
      "Workspace validation failed for content/math.json. JSON keys without Markdown files: Missing_Note. Markdown files without JSON keys: Category.md.",
    );
    assert.deepEqual(result, {
      ok: false,
      jsonKeysWithoutMarkdown: ["Missing_Note"],
      markdownKeysWithoutJson: ["Category"],
      duplicateMarkdownKeys: [],
    });
  }),
]);
