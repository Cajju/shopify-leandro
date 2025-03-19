export const constants = {
  resources: {
    SHOP: 'shop',
    PRODUCTS: 'products',
    SETTINGS: 'settings'
  },
  event: {
    app: {
      APP_LOADED: 'app::loaded',
      SERVER_ERROR: 'app::server_error',
      MS_WEBHOOKS_ERROR: 'app::ms_webhooks_error',
      API_CALLED: 'app::api_called',
      APP_INSTALLED: 'app::app_installed',
      APP_UNINSTALLED: 'app::app_uninstalled'
    },
    plans: {
      CHANGE_PRICING_PLAN: 'app::change_pricing_plan',
      PAYMENT_NOT_CONFIRMED: 'app::payment_not_confirmed'
    },
    page: {
      LOADED: 'page::loaded',
      ERROR: 'page::error'
    },
    data: {
      LOADED: `data::loaded`,
      SAVED: 'data::saved',
      UPDATED: 'data::updated',
      DELETED: 'data::deleted',
      EXPORTED: 'data::exported',
      IMPORTED: 'data::imported',
      FILTERED: 'data::filtered',
      SORTED: 'data::sorted'
    },
    interaction: {
      TEXTFIELD_CHANGED: 'interaction::textfield_changed',
      BUTTON_CLICKED: 'interaction::button_clicked',
      FORM_SUBMITTED: 'interaction::form_submitted',
      MODAL_OPENED: 'interaction::modal_opened',
      MODAL_CLOSED: 'interaction::modal_closed',
      ITEM_SELECTED: 'interaction::item_selected',
      FILTER_APPLIED: 'interaction::filter_applied'
    }
  }
}
