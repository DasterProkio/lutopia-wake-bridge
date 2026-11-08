import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SYSTEMD_UNIT = new URL("../deploy/systemd/lutopia-wake.service", import.meta.url);

test("systemd unit never restarts a stopped bridge", async () => {
  const unit = await readFile(SYSTEMD_UNIT, "utf8");

  assert.match(unit, /^Restart=no$/m);
  assert.doesNotMatch(unit, /^RestartPreventExitStatus=/m);
  assert.doesNotMatch(unit, /^RestartSec=/m);
  assert.doesNotMatch(unit, /^StartLimit/m);
  assert.match(unit, /^KillSignal=SIGTERM$/m);
  assert.match(unit, /^EnvironmentFile=\/etc\/lutopia-wake\.env$/m);
  assert.match(unit, /^User=lutopia-wake$/m);
  assert.doesNotMatch(unit, /LUTOPIA_API_KEY=/);
});
