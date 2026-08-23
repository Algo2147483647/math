import type { GraphLayoutMode } from "../graph/types";
import type { StageNode, StageRoutePoint } from "./types";

const SOURCE_EDGE_GAP = 4;
const TARGET_EDGE_GAP = 0;
const ORTHOGONAL_CORNER_RADIUS = 32;
const ELBOW_MIN_OFFSET = 34;
const ELBOW_MAX_OFFSET = 92;

export function resolveStageEdgeGeometry(
  layoutMode: GraphLayoutMode,
  sourceNode: StageNode,
  targetNode: StageNode,
  points?: StageRoutePoint[],
): { path: string; labelPosition: { x: number; y: number } } {
  const startX = sourceNode.x + sourceNode.width / 2 + SOURCE_EDGE_GAP;
  const startY = sourceNode.y;
  const endX = targetNode.x - targetNode.width / 2 - TARGET_EDGE_GAP;
  const endY = targetNode.y;
  const routePoints = points || [];
  const useLayeredRouteStyle = layoutMode === "sugiyama" || layoutMode === "dagre";

  return {
    path: useLayeredRouteStyle
      ? buildCompactLayeredPath(startX, startY, routePoints, endX, endY)
      : buildRoutedPath(startX, startY, routePoints, endX, endY),
    labelPosition: useLayeredRouteStyle
      ? getOrthogonalLabelPosition(startX, startY, routePoints, endX, endY)
      : getLabelPosition(startX, startY, routePoints, endX, endY),
  };
}

function buildRoutedPath(startX: number, startY: number, points: { x: number; y: number }[], endX: number, endY: number): string {
  if (!points.length) {
    const horizontalSpan = Math.max(endX - startX, 24);
    const verticalSpan = Math.abs(endY - startY);
    const bendBase = Math.max(horizontalSpan * 0.58, Math.min(verticalSpan * 0.22, 96), 64);
    const bend = Math.min(bendBase, horizontalSpan - 12);
    return [`M ${startX} ${startY}`, `C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`].join(" ");
  }

  const route = [{ x: startX, y: startY }, ...points, { x: endX, y: endY }];
  const commands = [`M ${route[0].x} ${route[0].y}`];

  for (let index = 1; index < route.length; index += 1) {
    const previous = route[index - 1];
    const current = route[index];
    const span = current.x - previous.x;
    const bend = Math.max(Math.abs(span) * 0.5, 42);
    const direction = span >= 0 ? 1 : -1;
    const controlA = {
      x: previous.x + bend * direction,
      y: previous.y,
    };
    const controlB = {
      x: current.x - bend * direction,
      y: current.y,
    };
    commands.push(`C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${current.x} ${current.y}`);
  }

  return commands.join(" ");
}

function buildCompactLayeredPath(startX: number, startY: number, points: { x: number; y: number }[], endX: number, endY: number): string {
  const route = points.length
    ? normalizeOrthogonalRoute([{ x: startX, y: startY }, ...points, { x: endX, y: endY }])
    : normalizeOrthogonalRoute(buildSingleElbowRoute(startX, startY, endX, endY));

  if (route.length < 2) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  return buildRoundedOrthogonalPath(route);
}

function getLabelPosition(startX: number, startY: number, points: { x: number; y: number }[], endX: number, endY: number): { x: number; y: number } {
  if (!points.length) {
    return { x: (startX + endX) / 2, y: (startY + endY) / 2 - 9 };
  }

  const route = [{ x: startX, y: startY }, ...points, { x: endX, y: endY }];
  const midpoint = route[Math.floor(route.length / 2)];
  return { x: midpoint.x, y: midpoint.y - 9 };
}

function getOrthogonalLabelPosition(startX: number, startY: number, points: { x: number; y: number }[], endX: number, endY: number): { x: number; y: number } {
  const route = points.length
    ? normalizeOrthogonalRoute([{ x: startX, y: startY }, ...points, { x: endX, y: endY }])
    : normalizeOrthogonalRoute(buildSingleElbowRoute(startX, startY, endX, endY));
  if (route.length < 2) {
    return { x: (startX + endX) / 2, y: (startY + endY) / 2 - 9 };
  }

  const segments = route.slice(1).map((point, index) => {
    const previous = route[index];
    const length = Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y);
    return { previous, point, length };
  });
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = totalLength / 2;

  for (const segment of segments) {
    if (remaining <= segment.length) {
      if (segment.previous.x === segment.point.x) {
        const direction = segment.point.y >= segment.previous.y ? 1 : -1;
        return { x: segment.point.x, y: segment.previous.y + remaining * direction - 9 };
      }
      const direction = segment.point.x >= segment.previous.x ? 1 : -1;
      return { x: segment.previous.x + remaining * direction, y: segment.previous.y - 9 };
    }
    remaining -= segment.length;
  }

  const fallback = route[Math.floor(route.length / 2)];
  return { x: fallback.x, y: fallback.y - 9 };
}

function buildSingleElbowRoute(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
  const horizontalSpan = Math.max(endX - startX, 0);
  const elbowOffset = clamp(horizontalSpan * 0.44, ELBOW_MIN_OFFSET, ELBOW_MAX_OFFSET);
  const elbowX = Math.min(startX + elbowOffset, endX - 18);
  if (Math.abs(endY - startY) < 6 || elbowX <= startX + 8) {
    return [
      { x: startX, y: startY },
      { x: endX, y: endY },
    ];
  }

  return [
    { x: startX, y: startY },
    { x: elbowX, y: startY },
    { x: elbowX, y: endY },
    { x: endX, y: endY },
  ];
}

function normalizeOrthogonalRoute(route: { x: number; y: number }[]): { x: number; y: number }[] {
  if (route.length <= 2) {
    return route;
  }

  const orthogonal: { x: number; y: number }[] = [route[0]];
  for (let index = 1; index < route.length; index += 1) {
    const previous = orthogonal[orthogonal.length - 1];
    const current = route[index];
    if (!previous) {
      orthogonal.push(current);
      continue;
    }

    if (previous.x !== current.x && previous.y !== current.y) {
      orthogonal.push({ x: current.x, y: previous.y });
    }
    orthogonal.push(current);
  }

  return simplifyOrthogonalRoute(orthogonal);
}

function simplifyOrthogonalRoute(route: { x: number; y: number }[]): { x: number; y: number }[] {
  const simplified: { x: number; y: number }[] = [];

  route.forEach((point) => {
    const previous = simplified[simplified.length - 1];
    if (previous && nearlyEqual(previous.x, point.x) && nearlyEqual(previous.y, point.y)) {
      return;
    }

    simplified.push(point);
    while (simplified.length >= 3) {
      const c = simplified[simplified.length - 1];
      const b = simplified[simplified.length - 2];
      const a = simplified[simplified.length - 3];
      const sameHorizontal = nearlyEqual(a.y, b.y) && nearlyEqual(b.y, c.y);
      const sameVertical = nearlyEqual(a.x, b.x) && nearlyEqual(b.x, c.x);
      if (!sameHorizontal && !sameVertical) {
        break;
      }
      simplified.splice(simplified.length - 2, 1);
    }
  });

  return simplified;
}

function buildRoundedOrthogonalPath(route: { x: number; y: number }[]): string {
  const commands = [`M ${route[0].x} ${route[0].y}`];

  for (let index = 1; index < route.length; index += 1) {
    const current = route[index];
    const previous = route[index - 1];
    const next = route[index + 1];

    if (!next) {
      commands.push(`L ${current.x} ${current.y}`);
      continue;
    }

    const incomingLength = distance(previous, current);
    const outgoingLength = distance(current, next);
    const radius = Math.min(ORTHOGONAL_CORNER_RADIUS, incomingLength / 2, outgoingLength / 2);
    const entry = moveToward(current, previous, radius);
    const exit = moveToward(current, next, radius);
    commands.push(`L ${entry.x} ${entry.y}`);
    commands.push(`Q ${current.x} ${current.y} ${exit.x} ${exit.y}`);
  }

  return commands.join(" ");
}

function moveToward(from: { x: number; y: number }, to: { x: number; y: number }, distancePx: number): { x: number; y: number } {
  if (nearlyEqual(from.x, to.x) && nearlyEqual(from.y, to.y)) {
    return { x: from.x, y: from.y };
  }

  if (nearlyEqual(from.x, to.x)) {
    return {
      x: from.x,
      y: from.y + Math.sign(to.y - from.y) * distancePx,
    };
  }

  return {
    x: from.x + Math.sign(to.x - from.x) * distancePx,
    y: from.y,
  };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.001;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
