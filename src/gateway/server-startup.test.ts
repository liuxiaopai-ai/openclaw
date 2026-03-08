import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyPluginRegistry } from "../plugins/registry.js";

const mocks = vi.hoisted(() => ({
  resolveAgentSessionDirs: vi.fn(async () => []),
  cleanStaleLockFiles: vi.fn(async () => {}),
  startBrowserControlServerIfEnabled: vi.fn(async () => null),
  startGmailWatcherWithLogs: vi.fn(async () => {}),
  clearInternalHooks: vi.fn(),
  loadInternalHooks: vi.fn(async () => 0),
  createInternalHookEvent: vi.fn(() => ({})),
  triggerInternalHook: vi.fn(async () => {}),
  startPluginServices: vi.fn(async () => null),
  startGatewayMemoryBackend: vi.fn(async () => {}),
  shouldWakeFromRestartSentinel: vi.fn(() => false),
  scheduleRestartSentinelWake: vi.fn(async () => {}),
}));

vi.mock("../agents/session-dirs.js", () => ({
  resolveAgentSessionDirs: mocks.resolveAgentSessionDirs,
}));

vi.mock("../agents/session-write-lock.js", () => ({
  cleanStaleLockFiles: mocks.cleanStaleLockFiles,
}));

vi.mock("../hooks/gmail-watcher-lifecycle.js", () => ({
  startGmailWatcherWithLogs: mocks.startGmailWatcherWithLogs,
}));

vi.mock("../hooks/internal-hooks.js", () => ({
  clearInternalHooks: mocks.clearInternalHooks,
  createInternalHookEvent: mocks.createInternalHookEvent,
  triggerInternalHook: mocks.triggerInternalHook,
}));

vi.mock("../hooks/loader.js", () => ({
  loadInternalHooks: mocks.loadInternalHooks,
}));

vi.mock("../plugins/services.js", () => ({
  startPluginServices: mocks.startPluginServices,
}));

vi.mock("./server-browser.js", () => ({
  startBrowserControlServerIfEnabled: mocks.startBrowserControlServerIfEnabled,
}));

vi.mock("./server-startup-memory.js", () => ({
  startGatewayMemoryBackend: mocks.startGatewayMemoryBackend,
}));

vi.mock("./server-restart-sentinel.js", () => ({
  shouldWakeFromRestartSentinel: mocks.shouldWakeFromRestartSentinel,
  scheduleRestartSentinelWake: mocks.scheduleRestartSentinelWake,
}));

const { startGatewaySidecars } = await import("./server-startup.js");

describe("startGatewaySidecars", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("waits for async plugin registration before loading startup hooks", async () => {
    const steps: string[] = [];
    let resolveReady: (() => void) | undefined;
    const pluginRegistry = createEmptyPluginRegistry();
    pluginRegistry.ready = new Promise<void>((resolve) => {
      resolveReady = () => {
        steps.push("ready");
        resolve();
      };
    });
    mocks.loadInternalHooks.mockImplementation(async () => {
      steps.push("hooks");
      return 0;
    });

    const startup = startGatewaySidecars({
      cfg: {},
      pluginRegistry,
      defaultWorkspaceDir: "/tmp/workspace",
      deps: {} as never,
      startChannels: async () => {
        steps.push("channels");
      },
      log: { warn: vi.fn() },
      logHooks: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      logChannels: { info: vi.fn(), error: vi.fn() },
      logBrowser: { error: vi.fn() },
    });

    await Promise.resolve();
    expect(steps).toEqual([]);

    resolveReady?.();
    await startup;

    expect(steps).toEqual(["ready", "hooks", "channels"]);
  });
});
