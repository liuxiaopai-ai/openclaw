import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestRuntime } from "./test-runtime-config-helpers.js";

const mocks = vi.hoisted(() => ({
  requireValidConfig: vi.fn(async () => ({})),
  writeConfigFile: vi.fn(async () => {}),
  logConfigUpdated: vi.fn(),
  resolveAgentWorkspaceDir: vi.fn(() => "/workspace/shared"),
  resolveAgentDir: vi.fn(() => "/agents/work"),
  resolveSessionTranscriptsDirForAgent: vi.fn(() => "/sessions/work"),
  findAgentEntryIndex: vi.fn(() => 0),
  listAgentEntries: vi.fn(() => [{ id: "work" }]),
  pruneAgentConfig: vi.fn(() => ({ config: {}, removedBindings: 1, removedAllow: 0 })),
  moveToTrash: vi.fn(async () => {}),
  isAgentWorkspaceShared: vi.fn(() => false),
}));

vi.mock("./agents.command-shared.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./agents.command-shared.js")>()),
  requireValidConfig: mocks.requireValidConfig,
}));

vi.mock("../config/config.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../config/config.js")>()),
  writeConfigFile: mocks.writeConfigFile,
}));

vi.mock("../config/logging.js", () => ({
  logConfigUpdated: mocks.logConfigUpdated,
}));

vi.mock("../agents/agent-scope.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../agents/agent-scope.js")>()),
  resolveAgentWorkspaceDir: mocks.resolveAgentWorkspaceDir,
  resolveAgentDir: mocks.resolveAgentDir,
}));

vi.mock("../agents/workspace-dirs.js", () => ({
  isAgentWorkspaceShared: mocks.isAgentWorkspaceShared,
}));

vi.mock("../config/sessions.js", () => ({
  resolveSessionTranscriptsDirForAgent: mocks.resolveSessionTranscriptsDirForAgent,
}));

vi.mock("./agents.config.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./agents.config.js")>()),
  findAgentEntryIndex: mocks.findAgentEntryIndex,
  listAgentEntries: mocks.listAgentEntries,
  pruneAgentConfig: mocks.pruneAgentConfig,
}));

vi.mock("./onboard-helpers.js", () => ({
  moveToTrash: mocks.moveToTrash,
}));

import { agentsDeleteCommand } from "./agents.commands.delete.js";

const runtime = createTestRuntime();

describe("agents delete command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireValidConfig.mockResolvedValue({});
    mocks.findAgentEntryIndex.mockReturnValue(0);
    mocks.listAgentEntries.mockReturnValue([{ id: "work" }]);
    mocks.pruneAgentConfig.mockReturnValue({ config: {}, removedBindings: 1, removedAllow: 0 });
    mocks.isAgentWorkspaceShared.mockReturnValue(false);
  });

  it("keeps shared workspaces on disk while pruning agent-specific state", async () => {
    mocks.isAgentWorkspaceShared.mockReturnValue(true);

    await agentsDeleteCommand({ id: "work", force: true }, runtime);

    expect(mocks.writeConfigFile).toHaveBeenCalledWith({});
    expect(mocks.moveToTrash).toHaveBeenCalledTimes(2);
    expect(mocks.moveToTrash).toHaveBeenNthCalledWith(1, "/agents/work", runtime);
    expect(mocks.moveToTrash).toHaveBeenNthCalledWith(2, "/sessions/work", runtime);
    expect(runtime.log).toHaveBeenCalledWith("Deleted agent: work");
  });
});
