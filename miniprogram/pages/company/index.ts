import { mapCompanyRows } from "../../utils/listFormat";
import {
  bindEntityListActions,
  goSettingsTab,
  listPageData,
  onListPageShow,
} from "../../utils/listPage";

const listActions = bindEntityListActions("/pages/company-edit/index");

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapCompanyRows);
  },
  goSettings: goSettingsTab,
  onAdd: listActions.onAdd,
  onItemTap: listActions.onItemTap,
});
