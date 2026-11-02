/**
 * 区块 #web2 的交互：模拟一次平台封禁。
 *
 * 只改前端状态：不请求任何接口，也不读写真实账号数据。
 * 每次状态变化同时写入 aria-live 区域，让读屏用户听到完整结果。
 */

const ICON_NORMAL = "✓";
const ICON_BANNED = "✕";

export function init(root) {
  const demo = root.querySelector("[data-web2-demo]");
  const live = root.querySelector("[data-web2-live]");
  const toast = root.querySelector("[data-web2-toast]");
  const banButton = root.querySelector('[data-web2-action="ban"]');
  const restoreButton = root.querySelector('[data-web2-action="restore"]');

  if (!demo || !live || !banButton || !restoreButton) {
    return;
  }

  const checks = Array.from(demo.querySelectorAll("[data-check]")).map((card) => {
    const status = card.querySelector("[data-check-status]");
    const icon = card.querySelector("[data-check-icon]");
    const value = card.querySelector("[data-check-value]");

    return {
      card,
      status,
      icon,
      value,
      name: card.dataset.checkName || "",
      normalStatus: status ? status.textContent : "",
      normalValue: value ? value.textContent : "",
      bannedStatus: card.dataset.bannedStatus || "",
      bannedValue: card.dataset.bannedValue || "",
    };
  });

  if (checks.length === 0) {
    return;
  }

  let banned = false;

  function render(nextBanned) {
    demo.dataset.web2State = nextBanned ? "banned" : "normal";

    if (toast) {
      toast.hidden = !nextBanned;
    }

    for (const check of checks) {
      check.card.dataset.checkState = nextBanned ? "banned" : "normal";

      if (check.status) {
        check.status.textContent = nextBanned
          ? check.bannedStatus
          : check.normalStatus;
      }

      if (check.icon) {
        check.icon.textContent = nextBanned ? ICON_BANNED : ICON_NORMAL;
      }

      if (check.value) {
        check.value.textContent =
          nextBanned && check.bannedValue
            ? check.bannedValue
            : check.normalValue;
      }
    }
  }

  function describeState() {
    return checks
      .map((check) => {
        const status = check.status ? check.status.textContent : "";
        return check.name ? `${check.name}：${status}` : status;
      })
      .filter(Boolean)
      .join("；");
  }

  function announce(prefix) {
    const message = `${prefix}${describeState()}。`;

    // 先清空再在下一轮事件循环写入，保证重复操作时同样的文案也会被重新播报。
    live.textContent = "";
    window.setTimeout(() => {
      live.textContent = message;
    }, 0);
  }

  function setBanned(nextBanned) {
    const changed = banned !== nextBanned;
    banned = nextBanned;
    render(nextBanned);

    if (!changed) {
      announce(
        nextBanned
          ? "当前已经是封禁状态。"
          : "当前已经是初始状态。"
      );
      return;
    }

    announce(nextBanned ? "平台已封禁。" : "已恢复初始状态。");
  }

  banButton.addEventListener("click", () => {
    setBanned(true);
  });

  restoreButton.addEventListener("click", () => {
    setBanned(false);
  });
}
