import { mapCustomerRows } from "../../utils/listFormat";
import {
  bindEntityListActions,
  goSettingsTab,
  listPageData,
  onListPageShow,
} from "../../utils/listPage";

const listActions = bindEntityListActions("/pages/customer-edit/index");

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapCustomerRows);
  },
  goSettings: goSettingsTab,
  onAdd: listActions.onAdd,
  onItemTap: listActions.onItemTap,
});
