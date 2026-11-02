/**
 * 区块 #opening 的三张场景卡。
 *
 * 交互约定：
 * - 鼠标点击整张卡展开 / 收起；
 * - Tab 逐个聚焦，左右方向键在卡片之间移动并展开目标卡；
 * - 同一时刻只展开一张，展开内容不会重叠；
 * - 在模块加载前，三张卡的内容全部可见；加载后才收起为手风琴。
 */

function getItems(root) {
  return Array.from(root.querySelectorAll("[data-opening-card]"))
    .map((card) => {
      const trigger = card.querySelector(".opening-card__trigger");
      const panel = card.querySelector(".opening-card__panel");

      if (!trigger || !panel) {
        return null;
      }

      return { card, trigger, panel };
    })
    .filter((item) => item !== null);
}

export function init(root) {
  const items = getItems(root);

  if (items.length === 0) {
    return;
  }

  const transition = root.querySelector("[data-opening-transition]");

  function isOpen(item) {
    return item.trigger.getAttribute("aria-expanded") === "true";
  }

  function setOpen(item, open) {
    item.trigger.setAttribute("aria-expanded", String(open));
    item.card.classList.toggle("is-open", open);
    item.panel.hidden = !open;
  }

  function syncTransition() {
    if (!transition) {
      return;
    }

    transition.hidden = !items.some(isOpen);
  }

  function openOnly(target) {
    for (const item of items) {
      setOpen(item, item === target);
    }
    syncTransition();
    target.trigger.focus();
  }

  function toggle(item) {
    const willOpen = !isOpen(item);

    if (willOpen) {
      for (const other of items) {
        if (other !== item) {
          setOpen(other, false);
        }
      }
    }

    setOpen(item, willOpen);
    syncTransition();
  }

  items.forEach((item, index) => {
    item.trigger.addEventListener("click", () => {
      toggle(item);
    });

    item.trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (isOpen(item)) {
          setOpen(item, false);
          syncTransition();
        }
        return;
      }

      let nextIndex = null;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % items.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + items.length) % items.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = items.length - 1;
      }

      if (nextIndex === null) {
        return;
      }

      event.preventDefault();
      openOnly(items[nextIndex]);
    });
  });

  // 渐进增强：脚本接管后先全部收起，读者点哪张看哪张。
  for (const item of items) {
    setOpen(item, false);
  }
  syncTransition();
}
