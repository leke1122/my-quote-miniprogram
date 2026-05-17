import { mapContractRows } from "../../utils/listFormat";
import { goSettingsTab, listPageData, onListPageShow } from "../../utils/listPage";

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapContractRows);
  },
  goSettings: goSettingsTab,
});
