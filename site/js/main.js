/**
 * 全站脚本入口。
 *
 * 两件事：
 * 1. 用 IntersectionObserver 给区块加入场效果；系统要求减少动态效果时完全跳过。
 * 2. 动态加载每个区块自己的模块；模块缺失时静默跳过，不影响静态内容。
 */

const SECTION_MODULES = {
  opening: () => import("./opening.js"),
  web2: () => import("./web2.js"),
  web3: () => import("./web3.js"),
  wallet: () => import("./wallet.js"),
  tx: () => import("./tx.js"),
  contract: () => import("./contract.js"),
  cost: () => import("./cost.js"),
  safety: () => import("./safety.js"),
  did: () => import("./did.js"),
  vc: () => import("./vc.js"),
  didflow: () => import("./didflow.js"),
  closing: () => import("./closing.js"),
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setupReveal() {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    return;
  }

  const sections = document.querySelectorAll("[data-reveal]");
  if (sections.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  for (const section of sections) {
    section.classList.add("is-reveal-ready");
    observer.observe(section);
  }
}

async function initSectionModules() {
  await Promise.all(
    Object.entries(SECTION_MODULES).map(async ([id, load]) => {
      const root = document.getElementById(id);
      if (!root) {
        return;
      }

      try {
        const module = await load();
        if (typeof module.init === "function") {
          module.init(root);
        }
      } catch {
        // 区块模块是可选增强：文件不存在或加载失败时保留占位内容，不抛错。
      }
    })
  );
}

function start() {
  setupReveal();
  void initSectionModules();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
