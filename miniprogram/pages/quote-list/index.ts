import { mapQuoteRows } from "../../utils/listFormat";
import {
  bindEntityListActions,
  goSettingsTab,
  listPageData,
  onListPageShow,
} from "../../utils/listPage";

const listActions = bindEntityListActions("/pages/quote-form/index");

Page({
  data: listPageData,
  onShow() {
    void onListPageShow(this, mapQuoteRows);
  },
  goSettings: goSettingsTab,
  onAdd: listActions.onAdd,
  onItemTap: listActions.onItemTap,
});
