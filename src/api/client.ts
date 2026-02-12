import type { EntityConfig } from "../types/entity";
import type { ApiTreeNode } from "../types/tree";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  DEFAULT_BASE_URL;
const treeRoute =
  (import.meta.env.VITE_TREE_ROUTE as string | undefined)?.trim() || "/tree";
const treeAppToken = (import.meta.env.VITE_TREE_APP_TOKEN as string | undefined) || "123LIDOR";
const clustersApiUrl = (import.meta.env.VITE_CLUSTERS_API_URL as string | undefined) || "";

// Mock clusters for dev mode (when no API URL is configured)
export const MOCK_CLUSTERS = ['cluster-dev-1', 'cluster-dev-2', 'cluster-dev-3', 'cluster-dev-4'];

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

export async function fetchOwningTeams(): Promise<string[]> {
  return request<string[]>("/owning-teams");
}

/**
 * Fetch cluster list from API or return mock data if no URL configured
 */
export async function fetchClusters(): Promise<string[]> {
  // Use mock data if no API URL is configured
  if (!clustersApiUrl) {
    return MOCK_CLUSTERS;
  }

  try {
    const response = await fetch(clustersApiUrl);
    if (!response.ok) {
      throw new Error(`Clusters request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.cluster || [];
  } catch (error) {
    console.warn("Failed to fetch clusters, falling back to mock data:", error);
    return MOCK_CLUSTERS;
  }
}

// Mock components for dev mode
export const MOCK_COMPONENTS = ['component-alpha', 'component-beta', 'component-gamma', 'component-delta'];
const componentsApiUrl = (import.meta.env.VITE_COMPONENTS_API_URL as string | undefined) || "";

/**
 * Fetch component list from API or return mock data if no URL configured
 * Used by the custom rule's "שם רכיב" static select
 */
export async function fetchComponents(): Promise<string[]> {
  if (!componentsApiUrl) {
    return MOCK_COMPONENTS;
  }

  try {
    const response = await fetch(componentsApiUrl);
    if (!response.ok) {
      throw new Error(`Components request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.components || [];
  } catch (error) {
    console.warn("Failed to fetch components, falling back to mock data:", error);
    return MOCK_COMPONENTS;
  }
}

export async function fetchTreeNodes(
  rootId: string,
  depth = 3,
  options?: { headers?: Record<string, string> }
): Promise<ApiTreeNode[]> {
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
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Tree request failed with status ${response.status}`);
    }
    return (await response.json()) as ApiTreeNode[];
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
): ApiTreeNode[] {
  const base = rootVid ?? "root";
  const nodes: ApiTreeNode[] = [];

  for (let i = 0; i < branching; i++) {
    const VID = makeVid(base, [currentDepth, i]);
    const node: ApiTreeNode = {
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
