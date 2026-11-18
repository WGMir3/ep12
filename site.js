"use strict";

function secureUrl(value, directory = false) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, location.href);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
    if (directory && (!url.pathname.endsWith("/") || url.search)) return null;
    return url;
  } catch {
    return null;
  }
}

async function loadServices() {
  const response = await fetch("./site.json", { cache: "no-store" });
  if (!response.ok) return;
  const settings = await response.json();
  const register = secureUrl(settings.registrationUrl);
  if (register) {
    const link = document.querySelector("#register-link");
    link.href = register.href;
    link.hidden = false;
    document.querySelector("#register-status").textContent = "建立帳號後，可用同一組帳密登入遊戲。";
  }
  const player = secureUrl(settings.playerDownloadUrl);
  if (player) {
    const link = document.querySelector("#download-link");
    link.href = player.href;
    link.textContent = "下載 Windows 啟動器";
    document.querySelector("#download-status").textContent = "解壓縮至遊戲資料夾，執行 RanEP12Launcher.exe。";
  }
  const releases = secureUrl(settings.releaseBaseUrl, true);
  if (!releases) return;
  const status = document.querySelector("#update-status");
  try {
    const result = await fetch(new URL("manifest.json", releases), { cache: "no-store" });
    if (!result.ok) throw new Error("Manifest unavailable");
    const manifest = await result.json();
    if (!Number.isSafeInteger(manifest.Version) || manifest.Version < 1) throw new Error("Invalid version");
    status.textContent = "最新版本 " + manifest.Version + "。";
  } catch {
    status.textContent = "暫時無法取得公開版本。";
  }
}

loadServices().catch(() => {});
