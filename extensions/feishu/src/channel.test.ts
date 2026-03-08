import type { OpenClawConfig } from "openclaw/plugin-sdk/feishu";
import { describe, expect, it, vi } from "vitest";

const probeFeishuMock = vi.hoisted(() => vi.fn());

vi.mock("./probe.js", () => ({
  probeFeishu: probeFeishuMock,
}));

import { feishuPlugin } from "./channel.js";

describe("feishuPlugin.status.probeAccount", () => {
  it("uses current account credentials for multi-account config", async () => {
    const cfg = {
      channels: {
        feishu: {
          enabled: true,
          accounts: {
            main: {
              appId: "cli_main",
              appSecret: "secret_main",
              enabled: true,
            },
          },
        },
      },
    } as OpenClawConfig;

    const account = feishuPlugin.config.resolveAccount(cfg, "main");
    probeFeishuMock.mockResolvedValueOnce({ ok: true, appId: "cli_main" });

    const result = await feishuPlugin.status?.probeAccount?.({
      account,
      timeoutMs: 1_000,
      cfg,
    });

    expect(probeFeishuMock).toHaveBeenCalledTimes(1);
    expect(probeFeishuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "main",
        appId: "cli_main",
        appSecret: "secret_main",
      }),
    );
    expect(result).toMatchObject({ ok: true, appId: "cli_main" });
  });
});

describe("feishuPlugin.threading.resolveReplyToMode", () => {
  it("defaults Feishu DMs to replyToMode=off", () => {
    const cfg = {
      channels: {
        feishu: {
          enabled: true,
          appId: "cli_main",
          appSecret: "secret_main",
        },
      },
    } as OpenClawConfig;

    const resolved = feishuPlugin.threading?.resolveReplyToMode?.({
      cfg,
      accountId: "default",
      chatType: "direct",
    });

    expect(resolved).toBe("off");
  });

  it("defaults Feishu groups to replyToMode=all", () => {
    const cfg = {
      channels: {
        feishu: {
          enabled: true,
          appId: "cli_main",
          appSecret: "secret_main",
        },
      },
    } as OpenClawConfig;

    const resolved = feishuPlugin.threading?.resolveReplyToMode?.({
      cfg,
      accountId: "default",
      chatType: "group",
    });

    expect(resolved).toBe("all");
  });

  it("honors explicit Feishu replyToMode config", () => {
    const cfg = {
      channels: {
        feishu: {
          enabled: true,
          appId: "cli_main",
          appSecret: "secret_main",
          replyToMode: "off",
        },
      },
    } as OpenClawConfig;

    const resolved = feishuPlugin.threading?.resolveReplyToMode?.({
      cfg,
      accountId: "default",
      chatType: "group",
    });

    expect(resolved).toBe("off");
  });
});
