"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MantineProvider,
  Loader,
  Container,
  Title,
  Text,
  UnstyledButton,
  Group,
  Button,
} from "@mantine/core";

type ApiNode = {
  DisplayName: string;
  VID: string;
  children: ApiNode[];
};

type MantineNode = {
  label: React.ReactNode;
  value: string;
  children?: MantineNode[];
};

interface TreeStepProps {
    onSelectNode: (nodeId: string) => void;
    selectedNode: string | null;
}

function apiToMantine(node: ApiNode): MantineNode {
  return {
    label: node.DisplayName,
    value: node.VID,
    children: node.children?.map(apiToMantine) ?? [],
  };
}

function updateNodeChildren(
  nodes: MantineNode[],
  value: string,
  children: MantineNode[]
): MantineNode[] {
  return nodes.map((n) => {
    if (n.value === value) {
      return { ...n, children };
    }
    if (n.children) {
      return {
        ...n,
        children: updateNodeChildren(n.children, value, children),
      };
    }
    return n;
  });
}

export default function TreeStep({ onSelectNode, selectedNode }: TreeStepProps) {
  const [data, setData] = useState<MantineNode[] | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: json } = await axios.get<ApiNode[]>("/api/tree", {
        params: { rootId: "root", TreeDepth: 3 },
        headers: {
          accept: "text/plain",
          AppToken: "123LIDOR",
        },
      });
      setData(json.map(apiToMantine));
    })();
  }, []);

  async function fetchChildren(vid: string) {
    setLoading((s) => ({ ...s, [vid]: true }));
    try {
      const { data: json } = await axios.get<ApiNode[]>("/api/tree", {
        params: { rootId: vid, TreeDepth: 3 },
        headers: {
          accept: "text/plain",
          AppToken: "123LIDOR",
        },
      });
      const mapped = json.map(apiToMantine);
      setData((prev) => (prev ? updateNodeChildren(prev, vid, mapped) : prev));
    } finally {
      setLoading((s) => ({ ...s, [vid]: false }));
    }
  }

  const TreeNodeView: React.FC<{ node: MantineNode; depth?: number }> = ({
    node,
    depth = 0,
  }) => {
    const isOpen = expanded.includes(node.value);
    const isSelected = selectedNode === node.value;

    const hasChildren = node.children && node.children.length > 0;

    return (
      <div style={{ marginBottom: 8 }}>
        <UnstyledButton
          onClick={async () => {
            if (hasChildren) {
                 setExpanded((s) =>
                    isOpen ? s.filter((v) => v !== node.value) : [...s, node.value]
                );
            } else {
                await fetchChildren(node.value);
                setExpanded((s) => [...s, node.value]);
            }
          }}
          style={{
            width: "auto",
            padding: "10px 14px",
            border: "1.5px solid #e0e0e0",
            borderRadius: 8,
            backgroundColor: isSelected ? "#e7f5ff" : (isOpen ? "#f8f9fa" : "#ffffff"),
            transition: "all 0.2s ease",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
           onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#4c6ef5";
            e.currentTarget.style.boxShadow =
              "0 2px 6px rgba(76, 110, 245, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e0e0e0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
          }}
        >
          <Group>
            { hasChildren && (
                 <div
                      style={{
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: "#4c6ef5",
                        fontWeight: "bold",
                      }}
                    >
                      {isOpen ? "▾" : "▸"}
                 </div>
            )}
            <div
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 500,
                color: "#212529",
              }}
            >
              {node.label}
            </div>
            {loading[node.value] && <Loader size="xs" />}
            {!hasChildren && <Button size="xs" onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.value)
            }}>Select</Button>}
          </Group>
        </UnstyledButton>

        {isOpen && node.children && node.children.length > 0 && (
          <div
            style={{
              marginLeft: 24,
              marginTop: 8,
              paddingLeft: 16,
              borderLeft: "2px solid #e9ecef",
            }}
          >
            {node.children.map((c) => (
              <TreeNodeView key={c.value} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <MantineProvider>
      <Container size="md" py="xl">
        <Title order={2} mb="md">
          Select a node
        </Title>
        {!data ? (
          <Loader />
        ) : (
          <>
            <Text size="sm" color="dimmed" mb="sm">
              Expand nodes. If a node has empty children, the client will
              request 3 more layers from the mock API using the node's `vid`. Select a leaf node to continue.
            </Text>

            <div>
              {data.map((n) => (
                <TreeNodeView key={n.value} node={n} />
              ))}
            </div>
          </>
        )}
      </Container>
    </MantineProvider>
  );
}
