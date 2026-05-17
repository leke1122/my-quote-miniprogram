import { EMPTY_HINT, type ListRow } from "./listFormat";
import { ensureWechatSession } from "./wechatAuth";

type ListPageData = {
  items: ListRow[];
  empty: boolean;
  emptyHint: string;
  countLabel: string;
};

export function refreshListPage(
  page: WechatMiniprogram.Page.Instance<ListPageData, WechatMiniprogram.IAnyObject>,
  mapper: () => ListRow[],
): void {
  const items = mapper();
  page.setData({
    items,
    empty: items.length === 0,
    emptyHint: EMPTY_HINT,
    countLabel: items.length > 0 ? `共 ${items.length} 条` : "",
  });
}

export async function onListPageShow(
  page: WechatMiniprogram.Page.Instance<ListPageData, WechatMiniprogram.IAnyObject>,
  mapper: () => ListRow[],
): Promise<void> {
  const ok = await ensureWechatSession();
  if (!ok) return;
  refreshListPage(page, mapper);
}

export function goSettingsTab(): void {
  wx.switchTab({ url: "/pages/settings/index" });
}

export const listPageData: ListPageData = {
  items: [],
  empty: true,
  emptyHint: EMPTY_HINT,
  countLabel: "",
};
