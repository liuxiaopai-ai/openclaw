import path from "node:path";
import type { OpenClawConfig } from "../config/config.js";
import { DEFAULT_AGENT_ID } from "../routing/session-key.js";
import { listAgentIds, resolveAgentWorkspaceDir, resolveDefaultAgentId } from "./agent-scope.js";

export function listAgentWorkspaceDirs(cfg: OpenClawConfig): string[] {
  const dirs = new Set<string>();
  const list = cfg.agents?.list;
  if (Array.isArray(list)) {
    for (const entry of list) {
      if (entry && typeof entry === "object" && typeof entry.id === "string") {
        dirs.add(resolveAgentWorkspaceDir(cfg, entry.id));
      }
    }
  }
  dirs.add(resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)));
  return [...dirs];
}

export function isAgentWorkspaceShared(cfg: OpenClawConfig, agentId: string): boolean {
  const targetWorkspaceDir = path.resolve(resolveAgentWorkspaceDir(cfg, agentId));
  const otherAgentIds = new Set<string>([
    DEFAULT_AGENT_ID,
    ...listAgentIds(cfg),
    resolveDefaultAgentId(cfg),
  ]);
  otherAgentIds.delete(agentId);
  for (const otherAgentId of otherAgentIds) {
    if (path.resolve(resolveAgentWorkspaceDir(cfg, otherAgentId)) === targetWorkspaceDir) {
      return true;
    }
  }
  return false;
}
