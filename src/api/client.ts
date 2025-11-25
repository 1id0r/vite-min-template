import type { EntityConfig, FormDefinition, StepKey } from "../types/entity";
import type { ApiTreeNode } from "../types/tree";

export type TreeApiNode = ApiTreeNode;

const DEFAULT_BASE_URL = "http://127.0.0.1:8001";
const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  DEFAULT_BASE_URL;
const treeRoute =
  (import.meta.env.VITE_TREE_ROUTE as string | undefined)?.trim() || "/tree";
const treeAppToken = (import.meta.env.VITE_TREE_APP_TOKEN as string | undefined) || "123LIDOR";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      const detail =
        typeof errorBody?.detail === "string"
          ? errorBody.detail
          : undefined;
      throw new Error(detail ?? `Request failed with status ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  return (await response.json()) as T;
}

export async function fetchEntityConfig(): Promise<EntityConfig> {
  return request<EntityConfig>("/config");
}

export async function fetchFormDefinition(
  systemId: string,
  stepKey: StepKey
): Promise<FormDefinition> {
  return request<FormDefinition>(`/systems/${systemId}/forms/${stepKey}`);
}

export async function fetchOwningTeams(): Promise<string[]> {
  return request<string[]>("/owning-teams");
}

export async function fetchTreeNodes(
  rootId: string,
  depth = 3,
  options?: { headers?: Record<string, string> }
): Promise<TreeApiNode[]> {
  const params = new URLSearchParams({
    rootId,
    TreeDepth: depth.toString(),
  });

  try {
    const headers: Record<string, string> = {
      accept: "text/plain",
      AppToken: treeAppToken,
      ...(options?.headers ?? {}),
    };

    const url = resolveTreeUrl(params);
    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Tree request failed with status ${response.status}`);
    }

    return (await response.json()) as TreeApiNode[];
  } catch (error) {
    console.warn("Falling back to generated mock tree data", error);
    return generateMockTree(rootId === "root" ? null : rootId, depth);
  }
}

function makeVid(prefix: string, parts: Array<string | number>) {
  return `${prefix}-${parts.join("-")}`;
}

function generateMockTree(
  rootVid: string | null,
  depth = 3,
  branching = 3,
  currentDepth = 1
): TreeApiNode[] {
  const base = rootVid ?? "root";
  const nodes: TreeApiNode[] = [];

  for (let i = 0; i < branching; i++) {
    const VID = makeVid(base, [currentDepth, i]);
    const node: TreeApiNode = {
      DisplayName: `Node ${VID}`,
      VID,
      children: [],
    };

    if (currentDepth < depth) {
      node.children = generateMockTree(VID, depth, branching, currentDepth + 1);
    }

    nodes.push(node);
  }

  return nodes;
}

function resolveTreeUrl(params: URLSearchParams) {
  const qs = params.toString();
  if (/^https?:\/\//i.test(treeRoute)) {
    return `${treeRoute}?${qs}`;
  }
  return `${baseUrl}${treeRoute}?${qs}`;
}
