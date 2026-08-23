import assert from "node:assert/strict";
import {
  formatMappedFieldLabel,
  getDisplayFieldName,
  getDefaultFieldMapping,
  getSemanticFieldName,
  inferFieldMapping,
  sanitizeFieldMapping,
  validateFieldMapping,
} from "../graph/fieldMapping";
import { serializeDag } from "../graph/serialize";
import { defineSuite, defineTest } from "./harness";
import { createCustomFieldMapping, createMappedSampleDag } from "./fixtures";

export const fieldMappingSuite = defineSuite("field-mapping", [
  defineTest("sanitizeFieldMapping falls back when aliases are duplicated or invalid", () => {
    const mapping = sanitizeFieldMapping({
      title: "label",
      define: "label",
      children: "kids",
      parents: "parents",
      type: "",
    });

    assert.deepEqual(mapping, {
      children: "kids",
      parents: "parents",
      define: "label",
      title: "title",
      type: "type",
    });
  }),

  defineTest("schema helpers resolve semantic names without rewriting raw field names", () => {
    const mapping = createCustomFieldMapping();

    assert.equal(getDisplayFieldName("title", mapping), "label");
    assert.equal(getDisplayFieldName("meta", mapping), "meta");
    assert.equal(getDisplayFieldName("define", mapping), "description");
    assert.equal(getSemanticFieldName("label", mapping), "title");
    assert.equal(getSemanticFieldName("description", mapping), "define");
    assert.equal(getSemanticFieldName("next", mapping), "children");
    assert.equal(getSemanticFieldName("meta", mapping), null);
    assert.equal(formatMappedFieldLabel("label", mapping), "label (title)");
    assert.equal(formatMappedFieldLabel("define", mapping), "define");
    assert.equal(formatMappedFieldLabel("description", mapping), "description (define)");
    assert.equal(formatMappedFieldLabel("meta", mapping), "meta");
  }),

  defineTest("serializeDag preserves mapped raw field names", () => {
    const mapping = createCustomFieldMapping();
    const dag = createMappedSampleDag();

    assert.deepEqual(serializeDag(dag, mapping).A, {
      label: "Alpha",
      description: "Root node",
      kind: "root",
      next: {
        B: "edge_ab",
        C: "edge_ac",
      },
    });
  }),

  defineTest("inferFieldMapping prefers a document's own field names over saved page preferences", () => {
    const fallback = createCustomFieldMapping();

    assert.deepEqual(inferFieldMapping({
      A: {
        title: "Alpha",
        define: "Root",
        type: "service",
        children: { B: "edge_ab" },
      },
    }, fallback), getDefaultFieldMapping());

    assert.deepEqual(inferFieldMapping({
      A: {
        label: "Alpha",
        description: "Root",
        kind: "service",
        next: { B: "edge_ab" },
      },
      B: {
        prev: { A: "edge_ab" },
      },
    }, getDefaultFieldMapping()), createCustomFieldMapping());
  }),

  defineTest("name is not treated as a title protocol alias", () => {
    assert.deepEqual(
      inferFieldMapping({ A: { name: "Alpha", children: {}, parents: {} } }),
      getDefaultFieldMapping(),
    );
  }),

  defineTest("validateFieldMapping accepts unique names and rejects duplicates", () => {
    const mapping = {
      ...getDefaultFieldMapping(),
      title: "label",
      define: "description",
    };

    assert.deepEqual(validateFieldMapping(mapping), { ok: true });
    assert.deepEqual(validateFieldMapping({ ...mapping, type: "label" }), {
      ok: false,
      message: 'Field display name "label" is duplicated.',
    });
  }),
]);
