import { mapProductRows } from "../../utils/listFormat";
import {
  bindEntityListActions,
  goSettingsTab,
  listPageData,
  onListPageShow,
} from "../../utils/listPage";

const listActions = bindEntityListActions("/pages/product-edit/index");

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapProductRows);
  },
  goSettings: goSettingsTab,
  onAdd: listActions.onAdd,
  onItemTap: listActions.onItemTap,
});
