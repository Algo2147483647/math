import type { AppearanceCommand } from "../graph/appearanceCommands";
import type { GraphLayoutAppearance } from "../graph/appearance";

export interface ConsoleLineError {
  line: number;
  message: string;
}

export type ConsoleNodeOperand =
  | { type: "key"; value: string }
  | { type: "context" };

export type ConsoleInstruction =
  | { type: "help"; line: number }
  | { type: "clear"; line: number }
  | { type: "keys"; line: number }
  | { type: "graphStats"; line: number }
  | { type: "find"; query: string; line: number }
  | { type: "neighbors"; key: ConsoleNodeOperand; depth: number; line: number }
  | { type: "path"; fromKey: ConsoleNodeOperand; toKey: ConsoleNodeOperand; line: number }
  | { type: "show"; key: ConsoleNodeOperand; line: number }
  | { type: "list"; key: ConsoleNodeOperand; line: number }
  | { type: "use"; key: ConsoleNodeOperand; line: number }
  | { type: "rename"; oldKey: ConsoleNodeOperand; newKey: string; line: number }
  | { type: "delete"; key: ConsoleNodeOperand; recursive: boolean; line: number }
  | { type: "add"; key: string; parentKey?: ConsoleNodeOperand; line: number }
  | { type: "setEdge"; parentKey: ConsoleNodeOperand; childKey: ConsoleNodeOperand; weight?: string | number | boolean | null; createMissing?: boolean; line: number }
  | { type: "removeEdge"; parentKey: ConsoleNodeOperand; childKey: ConsoleNodeOperand; line: number }
  | { type: "setParents"; key: ConsoleNodeOperand; keys: ConsoleNodeOperand[]; line: number }
  | { type: "setChildren"; key: ConsoleNodeOperand; keys: ConsoleNodeOperand[]; line: number }
  | { type: "setField"; key: ConsoleNodeOperand; field: string; value: unknown; line: number }
  | { type: "unsetField"; key: ConsoleNodeOperand; field: string; line: number }
  | { type: "appearance"; command: AppearanceCommand; line: number }
  | { type: "appearanceCssShow"; line: number }
  | { type: "json"; key: ConsoleNodeOperand; line: number };

type ConsoleToken =
  | { type: "word"; value: string }
  | { type: "string"; value: string }
  | { type: "symbol"; value: "," | "=" };

export function parseConsoleSource(source: string): { ok: true; instructions: ConsoleInstruction[] } | { ok: false; error: ConsoleLineError } {
  const instructions: ConsoleInstruction[] = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const rawLine = lines[index];
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) {
      continue;
    }

    const commandLine = normalizeCommandLine(rawLine);
    if (!commandLine.ok) {
      return { ok: false, error: { line: lineNumber, message: commandLine.message } };
    }

    const tokenized = tokenizeLine(commandLine.line);
    if (!tokenized.ok) {
      return { ok: false, error: { line: lineNumber, message: tokenized.message } };
    }

    const parsed = parseInstruction(tokenized.tokens, lineNumber);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }
    instructions.push(parsed.instruction);
  }

  return { ok: true, instructions };
}

function normalizeCommandLine(line: string): { ok: true; line: string } | { ok: false; message: string } {
  const trimmedStart = line.trimStart();
  if (!trimmedStart.startsWith("/")) {
    return { ok: false, message: "Console commands must start with /. Type /help for available commands, or enter plain text to ask AI." };
  }
  const commandLine = trimmedStart.slice(1);
  if (!commandLine.trim()) {
    return { ok: false, message: "Expected a command after /." };
  }
  return { ok: true, line: commandLine };
}

function tokenizeLine(line: string): { ok: true; tokens: ConsoleToken[] } | { ok: false; message: string } {
  const tokens: ConsoleToken[] = [];
  let index = 0;

  while (index < line.length) {
    const char = line[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === "," || char === "=") {
      tokens.push({ type: "symbol", value: char });
      index += 1;
      continue;
    }
    if (char === "\"") {
      let cursor = index + 1;
      let escaped = false;
      while (cursor < line.length) {
        const current = line[cursor];
        if (current === "\"" && !escaped) {
          break;
        }
        escaped = current === "\\" && !escaped;
        if (current !== "\\") {
          escaped = false;
        }
        cursor += 1;
      }
      if (cursor >= line.length || line[cursor] !== "\"") {
        return { ok: false, message: "Unterminated string literal." };
      }
      try {
        tokens.push({ type: "string", value: JSON.parse(line.slice(index, cursor + 1)) as string });
      } catch {
        return { ok: false, message: "Invalid string literal." };
      }
      index = cursor + 1;
      continue;
    }

    let cursor = index;
    while (cursor < line.length && !/\s/.test(line[cursor]) && line[cursor] !== "," && line[cursor] !== "=") {
      cursor += 1;
    }
    tokens.push({ type: "word", value: line.slice(index, cursor) });
    index = cursor;
  }

  return { ok: true, tokens };
}

function parseInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (!tokens.length) {
    return { ok: false, error: { line, message: "Expected an instruction." } };
  }

  const mnemonic = expectWordToken(tokens[0]);
  if (!mnemonic) {
    return { ok: false, error: { line, message: "Expected an instruction mnemonic." } };
  }

  switch (mnemonic.value) {
    case "help":
      return parseHelpInstruction(tokens, line);
    case "clear":
    case "cls":
      return parseClearInstruction(tokens, line);
    case "keys":
      return parseKeysInstruction(tokens, line);
    case "graph":
      return parseGraphInstruction(tokens, line);
    case "find":
      return parseFindInstruction(tokens, line);
    case "neighbors":
      return parseNeighborsInstruction(tokens, line);
    case "path":
      return parsePathInstruction(tokens, line);
    case "show":
      return parseSingleNodeInstruction(tokens, line, "show");
    case "ls":
      return parseSingleNodeInstruction(tokens, line, "list");
    case "use":
      return parseSingleNodeInstruction(tokens, line, "use");
    case "json":
      return parseSingleNodeInstruction(tokens, line, "json");
    case "mv":
      return parseRenameInstruction(tokens, line);
    case "rm":
      return parseDeleteInstruction(tokens, line);
    case "add":
      return parseAddInstruction(tokens, line);
    case "edge":
      return parseEdgeInstruction(tokens, line);
    case "rm-edge":
      return parseRemoveEdgeInstruction(tokens, line);
    case "parents":
      return parseRelationInstruction(tokens, line, "setParents");
    case "children":
      return parseRelationInstruction(tokens, line, "setChildren");
    case "set":
      return parseSetInstruction(tokens, line);
    case "unset":
      return parseUnsetInstruction(tokens, line);
    case "layout":
      return parseLayoutInstruction(tokens, line);
    case "style-var":
      return parseStyleVarInstruction(tokens, line);
    case "style-css":
      return parseStyleCssInstruction(tokens, line);
    case "style-reset":
      return parseStyleResetInstruction(tokens, line);
    default:
      return { ok: false, error: { line, message: `Unknown instruction "${mnemonic.value}".` } };
  }
}

function parseHelpInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 1) {
    return { ok: false, error: { line, message: "help does not accept any arguments." } };
  }
  return { ok: true, instruction: { type: "help", line } };
}

function parseClearInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 1) {
    return { ok: false, error: { line, message: "clear does not accept any arguments." } };
  }
  return { ok: true, instruction: { type: "clear", line } };
}

function parseKeysInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 1) {
    return { ok: false, error: { line, message: "keys does not accept any arguments." } };
  }
  return { ok: true, instruction: { type: "keys", line } };
}

function parseGraphInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 1) {
    return { ok: false, error: { line, message: "graph does not accept any arguments." } };
  }
  return { ok: true, instruction: { type: "graphStats", line } };
}

function parseFindInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length < 2) {
    return { ok: false, error: { line, message: "find expects a search query." } };
  }
  const query = tokens.slice(1).map((token) => token.value).join(" ").trim();
  if (!query) {
    return { ok: false, error: { line, message: "find expects a search query." } };
  }
  return { ok: true, instruction: { type: "find", query, line } };
}

function parseNeighborsInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 2 && tokens.length !== 3) {
    return { ok: false, error: { line, message: "neighbors expects <node> and optional depth." } };
  }
  const key = parseNodeOperand(tokens[1], true);
  if (!key) {
    return { ok: false, error: { line, message: "neighbors expects a node operand." } };
  }
  const depth = tokens[2] ? Number(parseLiteralToken(tokens[2])) : 1;
  if (!Number.isInteger(depth) || depth < 1 || depth > 4) {
    return { ok: false, error: { line, message: "neighbors depth must be an integer from 1 to 4." } };
  }
  return { ok: true, instruction: { type: "neighbors", key, depth, line } };
}

function parsePathInstruction(tokens: ConsoleToken[], line: number): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "path expects <from-node> <to-node>." } };
  }
  const fromKey = parseNodeOperand(tokens[1], true);
  const toKey = parseNodeOperand(tokens[2], true);
  if (!fromKey || !toKey) {
    return { ok: false, error: { line, message: "path expects two node operands." } };
  }
  return { ok: true, instruction: { type: "path", fromKey, toKey, line } };
}

function parseSingleNodeInstruction(
  tokens: ConsoleToken[],
  line: number,
  type: "show" | "list" | "use" | "json",
): { ok: true; instruction: ConsoleInstruction } | { ok: false; error: ConsoleLineError } {
  if (tokens.length !== 2) {
    return { ok: false, error: { line, message: `${type} expects exactly one node operand.` } };
  }
  const operand = parseNodeOperand(tokens[1], true);
  if (!operand) {
    return { ok: false, error: { line, message: "Expected a node operand." } };
  }
  return { ok: true, instruction: { type, key: operand, line } };
}

function parseRenameInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "mv expects <old-key> <new-key>." } } as const;
  }
  const oldKey = parseNodeOperand(tokens[1], true);
  const newKey = parseLiteralToken(tokens[2]);
  if (!oldKey || !newKey) {
    return { ok: false, error: { line, message: "mv expects <old-key> <new-key>." } } as const;
  }
  return { ok: true, instruction: { type: "rename", oldKey, newKey, line } satisfies ConsoleInstruction } as const;
}

function parseDeleteInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length === 2) {
    const key = parseNodeOperand(tokens[1], true);
    if (!key) {
      return { ok: false, error: { line, message: "rm expects a node operand." } } as const;
    }
    return { ok: true, instruction: { type: "delete", key, recursive: false, line } } as const;
  }
  if (tokens.length === 3 && expectWordToken(tokens[1])?.value === "-r") {
    const key = parseNodeOperand(tokens[2], true);
    if (!key) {
      return { ok: false, error: { line, message: "rm -r expects a node operand." } } as const;
    }
    return { ok: true, instruction: { type: "delete", key, recursive: true, line } } as const;
  }
  return { ok: false, error: { line, message: "rm expects either <node> or -r <node>." } } as const;
}

function parseAddInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 2 && tokens.length !== 4) {
    return { ok: false, error: { line, message: "add expects <new-key> or <new-key> -p <parent>." } } as const;
  }
  const key = parseLiteralToken(tokens[1]);
  if (!key) {
    return { ok: false, error: { line, message: "add expects a new node key." } } as const;
  }
  if (tokens.length === 2) {
    return { ok: true, instruction: { type: "add", key, line } } as const;
  }
  if (expectWordToken(tokens[2])?.value !== "-p") {
    return { ok: false, error: { line, message: "add only supports the -p modifier." } } as const;
  }
  const parentKey = parseNodeOperand(tokens[3], true);
  if (!parentKey) {
    return { ok: false, error: { line, message: "add -p expects a parent node operand." } } as const;
  }
  return { ok: true, instruction: { type: "add", key, parentKey, line } } as const;
}

function parseEdgeInstruction(tokens: ConsoleToken[], line: number) {
  const createMissingFlag = "--create-missing";
  const filteredTokens = tokens.filter((token, index) => index === 0 || expectWordToken(token)?.value !== createMissingFlag);
  const createMissing = filteredTokens.length !== tokens.length;

  if (filteredTokens.length !== 3 && filteredTokens.length !== 4) {
    return { ok: false, error: { line, message: "edge expects <parent> <child> [weight] and optionally --create-missing." } } as const;
  }

  const parentKey = parseNodeOperand(filteredTokens[1], true);
  const childKey = parseNodeOperand(filteredTokens[2], true);
  if (!parentKey || !childKey) {
    return { ok: false, error: { line, message: "edge expects <parent> <child> [weight] and optionally --create-missing." } } as const;
  }

  if (filteredTokens.length === 3) {
    return { ok: true, instruction: { type: "setEdge", parentKey, childKey, createMissing, line } } as const;
  }

  const weight = parseScalarLiteralToken(filteredTokens[3]);
  if (weight === undefined) {
    return { ok: false, error: { line, message: "edge weight must be a scalar literal." } } as const;
  }

  return { ok: true, instruction: { type: "setEdge", parentKey, childKey, weight, createMissing, line } } as const;
}

function parseRemoveEdgeInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "rm-edge expects <parent> <child>." } } as const;
  }

  const parentKey = parseNodeOperand(tokens[1], true);
  const childKey = parseNodeOperand(tokens[2], true);
  if (!parentKey || !childKey) {
    return { ok: false, error: { line, message: "rm-edge expects <parent> <child>." } } as const;
  }

  return { ok: true, instruction: { type: "removeEdge", parentKey, childKey, line } } as const;
}

function parseRelationInstruction(
  tokens: ConsoleToken[],
  line: number,
  type: "setParents" | "setChildren",
) {
  if (tokens.length < 3) {
    return { ok: false, error: { line, message: `${type === "setParents" ? "parents" : "children"} expects <node> = <list>.` } } as const;
  }
  const key = parseNodeOperand(tokens[1], true);
  if (!key || tokens[2].type !== "symbol" || tokens[2].value !== "=") {
    return { ok: false, error: { line, message: `${type === "setParents" ? "parents" : "children"} expects <node> = <list>.` } } as const;
  }
  const parsedList = parseNodeList(tokens.slice(3));
  if (!parsedList.ok) {
    return { ok: false, error: { line, message: parsedList.message } } as const;
  }
  return { ok: true, instruction: { type, key, keys: parsedList.operands, line } } as const;
}

function parseSetInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length < 4) {
    return { ok: false, error: { line, message: "set expects <node> <field> <value>." } } as const;
  }
  const key = parseNodeOperand(tokens[1], true);
  const field = parseLiteralToken(tokens[2]);
  const parsedValue = parseSetValueTokens(tokens.slice(3));
  if (!key || !field || !parsedValue.ok) {
    return { ok: false, error: { line, message: "set expects <node> <field> <value>." } } as const;
  }
  return { ok: true, instruction: { type: "setField", key, field, value: parsedValue.value, line } } as const;
}

function parseUnsetInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "unset expects <node> <field>." } } as const;
  }
  const key = parseNodeOperand(tokens[1], true);
  const field = parseLiteralToken(tokens[2]);
  if (!key || !field) {
    return { ok: false, error: { line, message: "unset expects <node> <field>." } } as const;
  }
  return { ok: true, instruction: { type: "unsetField", key, field, line } } as const;
}

function parseLayoutInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "layout expects <layout-key> <number>." } } as const;
  }
  const key = parseLiteralToken(tokens[1]);
  const value = Number(parseLiteralToken(tokens[2]));
  if (!isLayoutKey(key) || !Number.isFinite(value)) {
    return { ok: false, error: { line, message: "layout expects a valid layout key and finite number." } } as const;
  }
  return { ok: true, instruction: { type: "appearance", command: { type: "setLayout", key, value }, line } satisfies ConsoleInstruction } as const;
}

function parseStyleVarInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "style-var expects <var-name> <value>, or --unset <var-name>." } } as const;
  }
  if (tokens.length === 3 && expectWordToken(tokens[1])?.value === "--unset") {
    const key = parseLiteralToken(tokens[2]);
    if (!isDagCssVarName(key)) {
      return { ok: false, error: { line, message: "style-var --unset expects a --dag-* variable name." } } as const;
    }
    return { ok: true, instruction: { type: "appearance", command: { type: "unsetCssVar", key }, line } satisfies ConsoleInstruction } as const;
  }
  const key = parseLiteralToken(tokens[1]);
  const value = parseLiteralToken(tokens[2]);
  if (!isDagCssVarName(key) || value === null) {
    return { ok: false, error: { line, message: "style-var expects a --dag-* variable name and value." } } as const;
  }
  return { ok: true, instruction: { type: "appearance", command: { type: "setCssVar", key, value }, line } satisfies ConsoleInstruction } as const;
}

function parseStyleCssInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length === 1) {
    return { ok: true, instruction: { type: "appearanceCssShow", line } satisfies ConsoleInstruction } as const;
  }
  if (tokens.length === 2 && expectWordToken(tokens[1])?.value === "show") {
    return { ok: true, instruction: { type: "appearanceCssShow", line } satisfies ConsoleInstruction } as const;
  }
  if (tokens.length !== 3) {
    return { ok: false, error: { line, message: "style-css expects append <css>, replace <css>, or show." } } as const;
  }
  const operation = expectWordToken(tokens[1])?.value;
  const css = parseLiteralToken(tokens[2]);
  if (css === null) {
    return { ok: false, error: { line, message: "style-css expects CSS text." } } as const;
  }
  if (operation === "append") {
    return { ok: true, instruction: { type: "appearance", command: { type: "appendCss", css }, line } satisfies ConsoleInstruction } as const;
  }
  if (operation === "replace") {
    return { ok: true, instruction: { type: "appearance", command: { type: "replaceCss", css }, line } satisfies ConsoleInstruction } as const;
  }
  return { ok: false, error: { line, message: "style-css operation must be append, replace, or show." } } as const;
}

function parseStyleResetInstruction(tokens: ConsoleToken[], line: number) {
  if (tokens.length !== 1) {
    return { ok: false, error: { line, message: "style-reset does not accept arguments." } } as const;
  }
  return { ok: true, instruction: { type: "appearance", command: { type: "resetAppearance" }, line } satisfies ConsoleInstruction } as const;
}

function parseNodeList(tokens: ConsoleToken[]): { ok: true; operands: ConsoleNodeOperand[] } | { ok: false; message: string } {
  if (!tokens.length) {
    return { ok: true, operands: [] };
  }

  const operands: ConsoleNodeOperand[] = [];
  let expectsOperand = true;
  for (const token of tokens) {
    if (expectsOperand) {
      const operand = parseNodeOperand(token, true);
      if (!operand) {
        return { ok: false, message: "Expected a node operand in the relation list." };
      }
      operands.push(operand);
      expectsOperand = false;
      continue;
    }
    if (token.type !== "symbol" || token.value !== ",") {
      return { ok: false, message: "Expected a comma-separated relation list." };
    }
    expectsOperand = true;
  }

  if (expectsOperand) {
    return { ok: false, message: "Expected a node operand after the final comma." };
  }

  return { ok: true, operands };
}

function parseNodeOperand(token: ConsoleToken | undefined, allowContextAlias: boolean): ConsoleNodeOperand | null {
  if (!token) {
    return null;
  }
  if (token.type === "word" && token.value === "." && allowContextAlias) {
    return { type: "context" };
  }
  const value = parseLiteralToken(token);
  return value ? { type: "key", value } : null;
}

function parseLiteralToken(token: ConsoleToken | undefined): string | null {
  if (!token || token.type === "symbol") {
    return null;
  }
  return token.value;
}

function parseScalarLiteralToken(token: ConsoleToken | undefined): string | number | boolean | null | undefined {
  const value = parseLiteralToken(token);
  if (value === null) {
    return undefined;
  }
  if (/^true$/i.test(value)) {
    return true;
  }
  if (/^false$/i.test(value)) {
    return false;
  }
  if (/^null$/i.test(value)) {
    return null;
  }
  if (/^-?(?:\d+|\d*\.\d+)$/.test(value)) {
    const nextNumber = Number(value);
    if (Number.isFinite(nextNumber)) {
      return nextNumber;
    }
  }
  return value;
}

function parseSetValueTokens(tokens: ConsoleToken[]): { ok: true; value: unknown } | { ok: false } {
  if (!tokens.length) {
    return { ok: false };
  }

  if (tokens.length === 1) {
    if (tokens[0].type === "string") {
      return { ok: true, value: tokens[0].value };
    }
    const scalar = parseScalarLiteralToken(tokens[0]);
    return scalar === undefined ? { ok: false } : { ok: true, value: scalar };
  }

  const rawValue = stringifyValueTokens(tokens);
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return { ok: false };
  }

  if (trimmedValue.startsWith("{") || trimmedValue.startsWith("[") || trimmedValue.startsWith("\"")) {
    try {
      return { ok: true, value: JSON.parse(trimmedValue) };
    } catch {
      return { ok: false };
    }
  }

  if (tokens.every((token) => token.type !== "symbol")) {
    return { ok: true, value: tokens.map((token) => token.value).join(" ") };
  }

  return { ok: false };
}

function stringifyValueTokens(tokens: ConsoleToken[]): string {
  let output = "";

  tokens.forEach((token, index) => {
    if (token.type === "symbol") {
      output += token.value;
      return;
    }

    const value = token.type === "string" ? JSON.stringify(token.value) : token.value;
    const previousToken = tokens[index - 1];
    const needsLeadingSpace = index > 0 && previousToken?.type !== "symbol";
    output += `${needsLeadingSpace ? " " : ""}${value}`;
  });

  return output;
}

function expectWordToken(token: ConsoleToken | undefined): Extract<ConsoleToken, { type: "word" }> | null {
  return token?.type === "word" ? token : null;
}

function isDagCssVarName(value: string | null): value is `--dag-${string}` {
  return typeof value === "string" && value.startsWith("--dag-");
}

function isLayoutKey(value: string | null): value is keyof GraphLayoutAppearance {
  return value === "stagePaddingX"
    || value === "stagePaddingY"
    || value === "columnGap"
    || value === "rowGap"
    || value === "edgeLaneGap"
    || value === "nodeHeight"
    || value === "minNodeWidth"
    || value === "maxNodeWidth"
    || value === "stageMinWidth"
    || value === "stageMinHeight";
}
