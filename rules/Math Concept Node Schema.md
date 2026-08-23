# Math Concept Node Schema


## Schema

Use this as the default schema for a concept node:

```json
{
  "Concept_Name": {
    "define": "Markdown definition text with possible LaTeX",
    "parents": {
      "ParentConcept": "relation_label"
    },
    "children": {
      "ChildConcept": "relation_label"
    },
    "properties": "Supplementary Markdown content"
  }
}
```

Apply the template rules strictly:

- keep all four standard fields;
- use `""` for an empty `define`;
- use `{}` for empty `parents` and `children`;
- use `""` for empty `properties`;
- keep `parents` and `children` synchronized whenever possible;
- do not use `null`;
- keep `properties` as one Markdown string, not an array.

## Field Semantics

Reading Priority By Question Type:

- "What is X?" -> `define`
- "What does X belong to?" -> `parents`
- "What falls under X?" -> `children`
- "What properties, formulas, or remarks does X have?" -> `properties`
- "How is X related to Y?" -> read both nodes and compare `parents` / `children` first, then `define` if needed


### `define`

- Type: string
- Meaning: the primary definition block for the concept
- Recommended structure:
  - begin with a short intuitive explanation in Markdown block quote format
  - follow it with the full mathematically rigorous definition
- Typical content:
  - Markdown paragraphs
  - block quotes
  - LaTeX display math
  - inline math
  - links to related notes
- Best use:
  - answering "What is X?"
  - giving the formal or repository-native definition
  - extracting the main mathematical formula or setup

Preferred writing pattern:

```md
> A short intuitive explanation of the concept.

Then give the complete mathematical definition, with notation, assumptions, and formulas as needed.
```

The quoted opening should help a reader quickly understand the idea of the concept before reading the formal definition. The formal definition should then state the concept precisely enough for mathematical use.

Read `define` first for almost every concept question.

### `parents`

- Type: object mapping `RelatedConcept -> relation_label`
- Meaning: concept-level parent or dependency relations pointing upward or outward from the current concept
- Best use:
  - answering "What class does this belong to?"
  - identifying direct superconcepts or definitional dependencies
  - summarizing where the concept sits in the ontology

Do not flatten this into plain prose without keeping the relation label. 

### `children`

- Type: object mapping `RelatedConcept -> relation_label`
- Meaning: concept-level child or downstream relations from the current concept
- Best use:
  - answering "What specializations are listed under this concept?"
  - enumerating directly stored child concepts
  - showing outward structure from the current node

Do not assume `children` means examples. It is a relation map, not an example list.

#### Consistency Between `parents` And `children`

- `parents` and `children` should be kept consistent whenever nodes are created or edited.
- A relation recorded on either side is intended to be valid repository content.
- If `A.parents` contains `B: r`, then ideally `B.children` should contain `A: r`.
- If `A.children` contains `B: r`, then ideally `B.parents` should contain `A: r`.
- If the two sides are temporarily inconsistent, resolve the relation by taking the union rather than discarding either side.
- In other words, when `parents` and `children` disagree, treat both recorded entries as valid and use the combined set as the effective relation data until the notes are synchronized.

This policy makes inconsistency a repair issue rather than a reason to erase recorded structure.

### `properties`

- Type: string
- Meaning: supplementary Markdown content associated with the concept
- Typical content:
  - additional properties
  - formulas
  - theorem-like remarks
  - structured Markdown sections
  - lists, headings, image links, relative links, or local paths
- Current observed shape:
  - currently one Markdown string per node
  - the string may be empty or very long
- Best use:
  - answering "What properties or extra facts are recorded?"
  - retrieving formulas and extended notes
  - surfacing non-core detail after the main definition

