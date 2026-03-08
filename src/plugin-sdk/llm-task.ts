// Narrow plugin-sdk surface for the bundled llm-task plugin.
// Keep this list additive and scoped to symbols used under extensions/llm-task.

export { runEmbeddedPiAgent } from "../agents/pi-embedded.ts";
export { resolvePreferredOpenClawTmpDir } from "../infra/tmp-openclaw-dir.js";
export type { AnyAgentTool, OpenClawPluginApi } from "../plugins/types.js";
