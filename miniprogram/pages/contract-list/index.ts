import { mapContractRows } from "../../utils/listFormat";
import {
  bindEntityListActions,
  goSettingsTab,
  listPageData,
  onListPageShow,
} from "../../utils/listPage";

const listActions = bindEntityListActions("/pages/contract-form/index");

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapContractRows);
  },
  goSettings: goSettingsTab,
  onAdd: listActions.onAdd,
  onItemTap: listActions.onItemTap,
});
