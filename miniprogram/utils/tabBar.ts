/** 更新自定义底栏选中项（0 报价 / 1 合同 / 2 设置，-1 工作台） */
export function setTabBarSelected(index: number): void {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1] as WechatMiniprogram.Page.Instance<
    WechatMiniprogram.IAnyObject,
    { getTabBar?: () => { setData: (d: { selected: number }) => void } }
  >;
  if (typeof page?.getTabBar === "function") {
    const bar = page.getTabBar();
    if (bar) {
      bar.setData({ selected: index });
    }
  }
}
