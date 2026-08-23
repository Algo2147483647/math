import type { AiContextPacket, AiRequest, AiResponse, AiSettings, LegacyAiPlan, ProposedChange } from "./types";

const SYSTEM_PROMPT = [
  "You are DAG Studio's AI control assistant.",
  "You are running inside a structured graph editing agent harness.",
  "Use the Context Packet as the source of truth. Do not rely on hidden memory.",
  "The harness remembers active plans, pending command batches, recent events, graph revisions, and validation results.",
  "Every console command must start with / and must be one of the available commands in the command reference.",
  "Never mutate graph data directly. Use commands only.",
  "Resolve references in this priority order: activePlan, pendingCommandBatch, recentEvents, focused graph context, inspection commands, clarification.",
  "If the user says just now, above, as you said, based on your analysis, complete the changes, continue, or do it: first use activePlan or pendingCommandBatch when present.",
  "Do not ask the user to specify nodes when activePlan or recent artifacts already identify them.",
  "If graph facts are missing but inspectable, return inspect or read-only run_console commands such as /find, /ls, /neighbors, /path, or /graph.",
  "The response must be strict parseable JSON. Escape every double quote that appears inside command strings.",
  "When a /set command needs text, prefer unquoted plain text when possible; otherwise JSON-escape command quotes like: /set Water define \\\"2H2 + O2 -> 2H2O\\\".",
  "Do not wrap JSON in markdown fences.",
  "Return only JSON using response protocol v2:",
  '{"kind":"answer","answer":"..."}',
  '{"kind":"propose_changes","answer":"...","plan":{"title":"...","goal":"...","assumptions":[],"affectedNodes":[],"changes":[{"kind":"add_node","target":{"nodeId":"..."},"rationale":"...","draftCommands":["/add ..."],"risk":"low"}]},"draftCommands":[{"command":"/add ...","rationale":"...","risk":"low"}],"nextAction":{"type":"await_user_confirmation","message":"..."}}',
  '{"kind":"run_console","answer":"...","commandBatch":{"title":"...","commands":["/keys"],"expectedGraphEffects":[],"riskLevel":"low"},"preflightRequired":true}',
  '{"kind":"inspect","answer":"...","commands":["/find Group"]}',
  '{"kind":"clarify","answer":"...","missingInformation":[{"field":"...","reason":"..."}]}',
  "For analysis that implies edits, prefer propose_changes with draftCommands instead of plain answer.",
].join("\n");

export async function requestAiPlan({ settings, context, message }: AiRequest): Promise<AiResponse> {
  const prompt = buildUserPrompt(context, message);
  const raw = await requestProviderText(settings, SYSTEM_PROMPT, prompt);
  try {
    return parseAiResponse(raw);
  } catch (error) {
    const repairPrompt = buildRepairPrompt(prompt, raw, error);
    const repairedRaw = await requestProviderText(settings, SYSTEM_PROMPT, repairPrompt);
    try {
      return parseAiResponse(repairedRaw);
    } catch (repairError) {
      const originalMessage = error instanceof Error ? error.message : "AI response could not be parsed.";
      const repairMessage = repairError instanceof Error ? repairError.message : "The repaired AI response could not be parsed.";
      throw new Error(`${originalMessage} Retried once, but the repaired response was still invalid: ${repairMessage}`);
    }
  }
}

export async function testAiConnection(settings: AiSettings): Promise<string> {
  const raw = await requestProviderText(
    settings,
    "Return only a short JSON object: {\"kind\":\"answer\",\"answer\":\"ok\"}.",
    "Reply with ok.",
  );
  const plan = parseAiResponse(raw);
  return plan.kind === "answer" ? plan.answer : "ok";
}

function buildUserPrompt(context: AiContextPacket, message: string): string {
  return [
    "Context Packet:",
    JSON.stringify(context, null, 2),
    "",
    "Latest user request:",
    message,
  ].join("\n");
}

function buildRepairPrompt(originalPrompt: string, rawResponse: string, parseError: unknown): string {
  const message = parseError instanceof Error ? parseError.message : String(parseError);
  return [
    "Your previous response could not be parsed as JSON.",
    `Parse error: ${message}`,
    "",
    "Return the same intent as strict JSON only, following response protocol v2.",
    "Do not add markdown fences or commentary.",
    "Escape quotes inside command strings, especially /set text values.",
    "",
    "Original request:",
    originalPrompt,
    "",
    "Invalid response as a JSON string:",
    JSON.stringify(rawResponse),
  ].join("\n");
}

async function requestProviderText(settings: AiSettings, systemPrompt: string, userPrompt: string): Promise<string> {
  switch (settings.provider) {
    case "deepseek":
      return requestOpenAiCompatible(settings, systemPrompt, userPrompt);
    case "anthropic":
      return requestAnthropic(settings, systemPrompt, userPrompt);
    case "gemini":
      return requestGemini(settings, systemPrompt, userPrompt);
    case "ollama":
      return requestOllama(settings, systemPrompt, userPrompt);
    default:
      return requestOpenAiCompatible(settings, systemPrompt, userPrompt);
  }
}

async function requestOpenAiCompatible(settings: AiSettings, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${trimTrailingSlash(settings.baseUrl)}/chat/completions`, {
    method: "POST",
    headers: buildJsonHeaders(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}),
    body: JSON.stringify({
      model: settings.model,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const json = await parseResponseJson(response);
  const text = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("AI response did not include message content.");
  }
  return text;
}

async function requestAnthropic(settings: AiSettings, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${trimTrailingSlash(settings.baseUrl)}/v1/messages`, {
    method: "POST",
    headers: buildJsonHeaders({
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    }),
    body: JSON.stringify({
      model: settings.model,
      system: systemPrompt,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const json = await parseResponseJson(response);
  const text = json?.content?.map((item: { text?: unknown }) => item.text).filter((item: unknown) => typeof item === "string").join("\n");
  if (typeof text !== "string" || !text) {
    throw new Error("AI response did not include message content.");
  }
  return text;
}

async function requestGemini(settings: AiSettings, systemPrompt: string, userPrompt: string): Promise<string> {
  const endpoint = `${trimTrailingSlash(settings.baseUrl)}/v1beta/models/${encodeURIComponent(settings.model)}:generateContent`;
  const url = settings.apiKey ? `${endpoint}?key=${encodeURIComponent(settings.apiKey)}` : endpoint;
  const response = await fetch(url, {
    method: "POST",
    headers: buildJsonHeaders(),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    }),
  });
  const json = await parseResponseJson(response);
  const text = json?.candidates?.[0]?.content?.parts?.map((part: { text?: unknown }) => part.text).filter((item: unknown) => typeof item === "string").join("\n");
  if (typeof text !== "string" || !text) {
    throw new Error("AI response did not include message content.");
  }
  return text;
}

async function requestOllama(settings: AiSettings, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${trimTrailingSlash(settings.baseUrl)}/api/chat`, {
    method: "POST",
    headers: buildJsonHeaders(),
    body: JSON.stringify({
      model: settings.model,
      stream: false,
      options: {
        temperature: settings.temperature,
        num_predict: settings.maxTokens,
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const json = await parseResponseJson(response);
  const text = json?.message?.content;
  if (typeof text !== "string") {
    throw new Error("AI response did not include message content.");
  }
  return text;
}

export function parseAiResponse(raw: string): AiResponse {
  const jsonSource = extractJsonObject(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSource) as unknown;
  } catch (error) {
    throw new Error(formatJsonParseError(error, jsonSource));
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response was not a JSON object.");
  }
  const record = parsed as Record<string, unknown>;

  if (record.kind === "answer" && typeof record.answer === "string") {
    return { kind: "answer", answer: record.answer };
  }

  if (record.kind === "clarify" && typeof record.answer === "string") {
    const missingInformation = Array.isArray(record.missingInformation)
      ? record.missingInformation
        .map((item) => normalizeMissingInformation(item))
        .filter((item): item is { field: string; reason: string; candidates?: string[] } => Boolean(item))
      : undefined;
    return { kind: "clarify", answer: record.answer, missingInformation };
  }

  if (record.kind === "inspect" && typeof record.answer === "string" && Array.isArray(record.commands)) {
    return {
      kind: "inspect",
      answer: record.answer,
      commands: record.commands.map((command) => String(command).trim()).filter((command) => command.startsWith("/")),
    };
  }

  if (record.kind === "run_console" && typeof record.answer === "string" && isRecord(record.commandBatch)) {
    const commands = Array.isArray(record.commandBatch.commands)
      ? record.commandBatch.commands.map((command) => String(command).trim()).filter((command) => command.startsWith("/"))
      : [];
    if (!commands.length) {
      throw new Error("AI run_console response did not include commands.");
    }
    return {
      kind: "run_console",
      answer: record.answer,
      commandBatch: {
        title: typeof record.commandBatch.title === "string" ? record.commandBatch.title : undefined,
        commands,
        expectedGraphEffects: Array.isArray(record.commandBatch.expectedGraphEffects)
          ? record.commandBatch.expectedGraphEffects.map((effect) => String(effect))
          : undefined,
        riskLevel: normalizeRisk(record.commandBatch.riskLevel),
      },
      preflightRequired: record.preflightRequired !== false,
    };
  }

  if (
    record.kind === "propose_changes"
    && typeof record.answer === "string"
    && isRecord(record.plan)
    && typeof record.plan.title === "string"
    && typeof record.plan.goal === "string"
    && Array.isArray(record.plan.changes)
  ) {
    return {
      kind: "propose_changes",
      answer: record.answer,
      plan: {
        title: record.plan.title,
        goal: record.plan.goal,
        assumptions: Array.isArray(record.plan.assumptions) ? record.plan.assumptions.map((item) => String(item)) : [],
        affectedNodes: Array.isArray(record.plan.affectedNodes) ? record.plan.affectedNodes.map((item) => String(item)) : [],
        changes: record.plan.changes.map((item) => normalizeProposedChange(item)).filter((item): item is ProposedChange => Boolean(item)),
      },
      draftCommands: normalizeDraftCommands(record.draftCommands),
      nextAction: isRecord(record.nextAction) && typeof record.nextAction.type === "string" && typeof record.nextAction.message === "string"
        ? {
          type: normalizeNextAction(record.nextAction.type),
          message: record.nextAction.message,
        }
        : undefined,
    };
  }

  const legacy = parseLegacyAiPlan(record);
  if (legacy.type === "answer") {
    return { kind: "answer", answer: legacy.text };
  }
  return {
    kind: "run_console",
    answer: legacy.explanation,
    commandBatch: {
      commands: legacy.commands,
      riskLevel: "medium",
    },
    preflightRequired: true,
  };
}

function normalizeDraftCommands(value: unknown): Array<{ command: string; rationale?: string; risk?: "low" | "medium" | "high" }> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const commands: Array<{ command: string; rationale?: string; risk?: "low" | "medium" | "high" }> = [];
  value.forEach((item) => {
    if (!isRecord(item) || typeof item.command !== "string") {
      return;
    }
    commands.push({
      command: item.command,
      rationale: typeof item.rationale === "string" ? item.rationale : undefined,
      risk: normalizeRisk(item.risk),
    });
  });
  return commands;
}

function parseLegacyAiPlan(record: Record<string, unknown>): LegacyAiPlan {
  if (record.type === "answer" && typeof record.text === "string") {
    return { type: "answer", text: record.text };
  }
  if (
    record.type === "run_console"
    && typeof record.explanation === "string"
    && Array.isArray(record.commands)
    && record.commands.every((command) => typeof command === "string" && command.trim().startsWith("/"))
  ) {
    return {
      type: "run_console",
      explanation: record.explanation,
      commands: record.commands.map((command) => command.trim()).filter(Boolean),
    };
  }
  throw new Error("AI response did not match the expected response protocol.");
}

function normalizeProposedChange(value: unknown): ProposedChange | null {
  if (!isRecord(value) || typeof value.kind !== "string" || typeof value.rationale !== "string" || !Array.isArray(value.draftCommands)) {
    return null;
  }
  const allowedKinds = new Set([
    "add_node",
    "set_property",
    "add_edge",
    "remove_edge",
    "merge_node",
    "rename_node",
    "restructure_subgraph",
  ]);
  if (!allowedKinds.has(value.kind)) {
    return null;
  }
  return {
    id: typeof value.id === "string" ? value.id : undefined,
    kind: value.kind as ProposedChange["kind"],
    target: normalizeTarget(value.target),
    rationale: value.rationale,
    draftCommands: value.draftCommands.map((command) => String(command).trim()).filter((command) => command.startsWith("/")),
    dependencies: Array.isArray(value.dependencies) ? value.dependencies.map((item) => String(item)) : undefined,
    risk: normalizeRisk(value.risk),
  };
}

function normalizeTarget(value: unknown): ProposedChange["target"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return {
    nodeId: typeof value.nodeId === "string" ? value.nodeId : undefined,
    edgeId: typeof value.edgeId === "string" ? value.edgeId : undefined,
    property: typeof value.property === "string" ? value.property : undefined,
  };
}

function normalizeMissingInformation(value: unknown): { field: string; reason: string; candidates?: string[] } | null {
  if (!isRecord(value) || typeof value.field !== "string" || typeof value.reason !== "string") {
    return null;
  }
  return {
    field: value.field,
    reason: value.reason,
    candidates: Array.isArray(value.candidates) ? value.candidates.map((item) => String(item)) : undefined,
  };
}

function normalizeRisk(value: unknown): "low" | "medium" | "high" | undefined {
  return value === "low" || value === "medium" || value === "high" ? value : undefined;
}

function normalizeNextAction(value: string): "await_user_confirmation" | "validate_then_execute" | "needs_inspection" {
  return value === "validate_then_execute" || value === "needs_inspection" ? value : "await_user_confirmation";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractJsonObject(raw: string): string {
  const trimmed = stripJsonFence(raw.trim());
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  throw new Error("AI response did not contain JSON.");
}

function stripJsonFence(value: string): string {
  const fenceMatch = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : value;
}

function formatJsonParseError(error: unknown, source: string): string {
  const nativeMessage = error instanceof Error ? error.message : "Invalid JSON.";
  const position = extractJsonErrorPosition(nativeMessage);
  const location = position === null ? "" : ` near ${formatJsonLocation(source, position)}`;
  const snippet = position === null ? "" : ` Snippet: ${JSON.stringify(buildJsonErrorSnippet(source, position))}`;
  return [
    `AI response contained invalid JSON${location}: ${nativeMessage}.`,
    "Command strings must escape nested double quotes, for example: /set Water define \\\"2H2 + O2 -> 2H2O\\\".",
    snippet,
  ].filter(Boolean).join(" ");
}

function extractJsonErrorPosition(message: string): number | null {
  const match = message.match(/position\s+(\d+)/i);
  if (!match) {
    return null;
  }
  const position = Number(match[1]);
  return Number.isInteger(position) && position >= 0 ? position : null;
}

function formatJsonLocation(source: string, position: number): string {
  const before = source.slice(0, position);
  const line = before.split(/\r?\n/).length;
  const lastLineBreak = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r"));
  const column = position - lastLineBreak;
  return `line ${line}, column ${column}`;
}

function buildJsonErrorSnippet(source: string, position: number): string {
  const start = Math.max(0, position - 80);
  const end = Math.min(source.length, position + 80);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
}

async function parseResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!response.ok) {
    const message = json?.error?.message || json?.error || text || `AI request failed with HTTP ${response.status}.`;
    throw new Error(typeof message === "string" ? message : `AI request failed with HTTP ${response.status}.`);
  }
  return json;
}

function buildJsonHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  Object.keys(headers).forEach((key) => {
    if (!headers[key]) {
      delete headers[key];
    }
  });
  return headers;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
