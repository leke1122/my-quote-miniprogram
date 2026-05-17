import { mapCompanyRows } from "../../utils/listFormat";
import { goSettingsTab, listPageData, onListPageShow } from "../../utils/listPage";

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapCompanyRows);
  },
  goSettings: goSettingsTab,
});
