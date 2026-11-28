/* 公共版本库：每个 Release 的附件自动变成一张卡；读不到 GitHub 时退回内置清单。 */
(function () {
  "use strict";

  var OWNER = "yeco2656-jpg";
  var REPO = "dragonlauncher";
  var grid = document.getElementById("libraryGrid");
  var status = document.getElementById("libraryStatus");
  if (!grid) return;

  var API_HEADERS = { "Accept": "application/vnd.github+json" };
  var FALLBACK = [
    { name: "DragonLauncher-v0.8.7.zip", tag: "v0.8.7", size: 36327497, date: "2026-11-28T05:40:00Z", latest: true },
    { name: "DragonLauncher-v0.8.6.zip", tag: "v0.8.6", size: 36301890, date: "2026-11-23T09:42:52Z" },
    { name: "DragonLauncher-v0.8.4.zip", tag: "v0.8.4", size: 36292485, date: "2026-11-23T04:59:00Z" },
    { name: "DragonLauncher-v0.8.3.zip", tag: "v0.8.3", size: 36238343, date: "2026-11-23T04:27:00Z" },
    { name: "DragonLauncher-v0.8.2.zip", tag: "v0.8.2", size: 35964064, date: "2026-11-23T03:43:00Z" },
    { name: "DragonLauncher-v0.8.1.zip", tag: "v0.8.1", size: 36007281, date: "2026-11-23T03:03:00Z" },
    { name: "DragonLauncher-v0.6.0.zip", tag: "v0.6.0", size: 45791179, date: "2026-11-22T13:40:00Z" },
    { name: "DragonLauncher-v0.4.0.zip", tag: "v0.4.0", size: 45711425, date: "2026-11-22T13:42:00Z" },
    { name: "DragonLauncher-v0.3.0.zip", tag: "v0.3.0", size: 44129265, date: "2026-11-22T13:42:00Z" },
    { name: "DragonLauncher-v0.2.0.zip", tag: "v0.2.0", size: 41504989, date: "2026-11-22T13:42:00Z" },
    { name: "DragonLauncher-friend-0.2.0-update.zip", tag: "v0.2.0", size: 23332377, date: "2026-11-22T14:44:00Z" },
    { name: "DragonLauncher-v0.1.0.zip", tag: "v0.1.0", size: 40917420, date: "2026-11-22T13:41:00Z" }
  ];

  function downloadUrl(tag, name) {
    return "https://github.com/" + OWNER + "/" + REPO + "/releases/download/" + tag + "/" + encodeURIComponent(name);
  }

  function formatSize(bytes) {
    if (!bytes || bytes < 1000) return "小于 1 KB";
    if (bytes < 1000 * 1000) return Math.round(bytes / 1000) + " KB";
    return (bytes / (1000 * 1000)).toFixed(1) + " MB";
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return (d.getMonth() + 1) + " 月 " + d.getDate() + " 日";
  }

  function versionKey(tag) {
    var m = String(tag || "").match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return null;
    return parseInt(m[1], 10) * 10000 + parseInt(m[2], 10) * 100 + parseInt(m[3], 10);
  }

  // 作品库只收 "vX.Y.Z" 形式的启动器版本；主题包等附属 Release 不进这张表。
  function isVersionTag(tag) {
    return /^v\d+\.\d+\.\d+(?:[-.][0-9A-Za-z.-]*)?$/.test(String(tag || ""));
  }

  // 版本号大的在前；版本号相同（比如主包和增量包）再按发布时间。
  function sortByVersionDesc(items) {
    return items.slice().sort(function (a, b) {
      var ka = versionKey(a.tag);
      var kb = versionKey(b.tag);
      if (ka !== null && kb !== null && ka !== kb) return kb - ka;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }

  function buildCard(item, badgeText, note) {
    var card = document.createElement("article");
    card.className = "library-card";
    var badge = document.createElement("span");
    badge.className = item.latest ? "badge" : "badge badge-muted";
    badge.textContent = badgeText || item.tag;
    var title = document.createElement("h3");
    title.textContent = item.name;
    var meta = document.createElement("p");
    var bits = [];
    if (item.tag) bits.push(item.tag);
    if (item.size) bits.push(formatSize(item.size));
    var day = formatDate(item.date);
    if (day) bits.push(day);
    if (item.latest) bits.push("最新");
    if (note) bits.push(note);
    meta.textContent = bits.join(" · ");
    var link = document.createElement("a");
    link.href = item.url || downloadUrl(item.tag, item.name);
    link.textContent = "从 Release 下载";
    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(link);
    return card;
  }

  function render(items, message) {
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    items.forEach(function (item) { grid.appendChild(buildCard(item)); });
    if (status) status.textContent = message;
  }

  // packages/ 当草稿区：临时放个 zip 也能出现在列表末尾。
  function loadScratch(existing) {
    var api = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/packages?ref=main";
    fetch(api, { headers: API_HEADERS })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (files) {
        if (!Array.isArray(files)) return;
        var scratch = files.filter(function (file) {
          return file && file.type === "file" && /\.(zip|jar|exe|7z|rar|tar|gz)$/i.test(file.name);
        });
        scratch.forEach(function (file) {
          grid.appendChild(buildCard({ name: file.name, size: file.size, url: file.download_url }, "草稿区", "临时文件"));
        });
        if (status && scratch.length) {
          status.textContent = "已连接 GitHub · " + existing + " 个版本包 + " + scratch.length + " 个草稿区文件。";
        }
      })
      .catch(function () { /* 草稿区读不到不影响版本列表 */ });
  }

  function loadFromApi() {
    var listUrl = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/releases?per_page=100";
    var latestUrl = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/releases/latest";
    var latestTag = null;

    fetch(latestUrl, { headers: API_HEADERS })
      .then(function (response) { return response.ok ? response.json() : null; })
      .catch(function () { return null; })
      .then(function (latest) {
        if (latest && latest.tag_name && isVersionTag(latest.tag_name)) latestTag = latest.tag_name;
        return fetch(listUrl, { headers: API_HEADERS });
      })
      .then(function (response) {
        if (response.status === 403) throw new Error("API 限流");
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error("数据格式不对");
        var items = [];
        list.forEach(function (release) {
          if (!release || release.draft) return;
          if (!isVersionTag(release.tag_name)) return;
          if (!latestTag && !release.prerelease) latestTag = release.tag_name;
          (release.assets || []).forEach(function (asset) {
            if (!/\.(zip|jar|exe|7z|rar|tar|gz)$/i.test(asset.name)) return;
            items.push({
              name: asset.name,
              tag: release.tag_name,
              size: asset.size,
              date: release.published_at || release.created_at,
              url: asset.browser_download_url || downloadUrl(release.tag_name, asset.name),
              latest: release.tag_name === latestTag
            });
          });
        });
        if (!items.length) throw new Error("没有附件");
        var sorted = sortByVersionDesc(items);
        render(sorted, "已连接 GitHub · 共 " + sorted.length + " 个版本包，最新是 " + sorted[0].tag + "。");
        loadScratch(sorted.length);
      })
      .catch(function (error) {
        var fallback = sortByVersionDesc(FALLBACK);
        render(fallback, "暂时读不到 GitHub 版本库（" + error.message + "），下面是内置清单，下载按钮仍可用。");
        loadScratch(0);
      });
  }

  loadFromApi();
})();
