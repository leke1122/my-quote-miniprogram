const TAB_LIST = [
  {
    pagePath: "/pages/quote-new/index",
    text: "报价",
    iconPath: "/assets/tab-quote.png",
    selectedIconPath: "/assets/tab-quote-active.png",
  },
  {
    pagePath: "/pages/contract-new/index",
    text: "合同",
    iconPath: "/assets/tab-contract.png",
    selectedIconPath: "/assets/tab-contract-active.png",
  },
  {
    pagePath: "/pages/settings/index",
    text: "设置",
    iconPath: "/assets/tab-settings.png",
    selectedIconPath: "/assets/tab-settings-active.png",
  },
] as const;

Component({
  data: {
    selected: -1,
    color: "#94a3b8",
    selectedColor: "#131b2e",
    list: TAB_LIST,
  },
  methods: {
    onSwitchTab(e: WechatMiniprogram.TouchEvent) {
      const path = e.currentTarget.dataset.path as string;
      const index = Number(e.currentTarget.dataset.index);
      if (!path) return;
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    },
  },
});
