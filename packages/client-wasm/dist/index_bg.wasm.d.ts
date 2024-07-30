/* tslint:disable */
/* eslint-disable */
export function __wbg_loaderhelper_free(a: number): void;
export function loaderhelper_mainJS(a: number): number;
export function worker_entry_point(a: number): void;
export function __wbg_programbindings_free(a: number): void;
export function programbindings_new(a: number, b: number, c: number): void;
export function programbindings_add_input_party(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): void;
export function programbindings_add_output_party(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): void;
export function __wbg_clusterdescriptor_free(a: number): void;
export function clusterdescriptor_id(a: number, b: number): void;
export function clusterdescriptor_parties(a: number, b: number): void;
export function clusterdescriptor_prime(a: number, b: number): void;
export function clusterdescriptor_kappa(a: number): number;
export function __wbg_preprocessingprotocolconfig_free(a: number): void;
export function preprocessingprotocolconfig_batch_size(a: number): number;
export function __wbg_nadavalue_free(a: number): void;
export function nadavalue_new_secret_integer(
  a: number,
  b: number,
  c: number,
): void;
export function nadavalue_new_secret_unsigned_integer(
  a: number,
  b: number,
  c: number,
): void;
export function nadavalue_new_secret_blob(a: number, b: number): number;
export function nadavalue_new_public_integer(
  a: number,
  b: number,
  c: number,
): void;
export function nadavalue_new_public_unsigned_integer(
  a: number,
  b: number,
  c: number,
): void;
export function nadavalue_to_byte_array(a: number, b: number): void;
export function nadavalue_to_integer(a: number, b: number): void;
export function __wbg_nadavalues_free(a: number): void;
export function nadavalues_new(a: number): void;
export function nadavalues_insert(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function nadavalues_length(a: number): number;
export function __wbg_nillionclient_free(a: number): void;
export function nillionclient_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;
export function nillionclient_enable_remote_logging(): void;
export function nillionclient_party_id(a: number, b: number): void;
export function nillionclient_user_id(a: number, b: number): void;
export function nillionclient_store_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): number;
export function nillionclient_retrieve_value(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
): number;
export function nillionclient_update_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
): number;
export function nillionclient_delete_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): number;
export function nillionclient_compute(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
): number;
export function nillionclient_compute_result(
  a: number,
  b: number,
  c: number,
): number;
export function nillionclient_retrieve_permissions(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): number;
export function nillionclient_update_permissions(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
): number;
export function nillionclient_store_program(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
): number;
export function nillionclient_request_price_quote(
  a: number,
  b: number,
  c: number,
  d: number,
): number;
export function nillionclient_cluster_information(
  a: number,
  b: number,
  c: number,
): number;
export function nillionclient_enable_tracking(
  a: number,
  b: number,
  c: number,
): void;
export function nillionclient_build_version(a: number): void;
export function __wbg_pricequote_free(a: number): void;
export function pricequote_expires_at(a: number): number;
export function pricequote_cost(a: number): number;
export function pricequote_nonce(a: number, b: number): void;
export function __wbg_operationcost_free(a: number): void;
export function operationcost_base_fee(a: number, b: number): void;
export function operationcost_congestion_fee(a: number, b: number): void;
export function operationcost_storage_fee(a: number, b: number): void;
export function operationcost_preprocessing_fee(a: number, b: number): void;
export function operationcost_compute_fee(a: number, b: number): void;
export function operationcost_total(a: number, b: number): void;
export function __wbg_paymentreceipt_free(a: number): void;
export function paymentreceipt_new(a: number, b: number, c: number): number;
export function __wbg_operation_free(a: number): void;
export function operation_store_values(a: number, b: number, c: number): void;
export function operation_update_values(a: number, b: number, c: number): void;
export function operation_compute(a: number, b: number, c: number): number;
export function operation_retrieve_value(): number;
export function operation_store_program(a: number, b: number, c: number): void;
export function operation_retrieve_permissions(): number;
export function operation_update_permissions(): number;
export function __wbg_nodekey_free(a: number): void;
export function nodekey_from_seed(a: number, b: number): number;
export function nodekey_from_base58(a: number, b: number): number;
export function __wbg_userkey_free(a: number): void;
export function userkey_generate(): number;
export function userkey_from_seed(a: number, b: number, c: number): void;
export function userkey_public_key(a: number, b: number): void;
export function userkey_from_base58(a: number, b: number, c: number): void;
export function userkey_to_base58(a: number, b: number): void;
export function __wbg_permissions_free(a: number): void;
export function permissions_new(): number;
export function permissions_default_for_user(a: number, b: number): number;
export function permissions_add_retrieve_permissions(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function permissions_add_update_permissions(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function permissions_add_delete_permissions(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function permissions_add_compute_permissions(
  a: number,
  b: number,
  c: number,
): void;
export function permissions_is_retrieve_allowed(
  a: number,
  b: number,
  c: number,
): number;
export function permissions_is_update_allowed(
  a: number,
  b: number,
  c: number,
): number;
export function permissions_is_delete_allowed(
  a: number,
  b: number,
  c: number,
): number;
export function permissions_is_compute_allowed(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): number;
export const memory: WebAssembly.Memory;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(
  a: number,
  b: number,
  c: number,
  d: number,
): number;
export const __wbindgen_export_3: WebAssembly.Table;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h4c39054f7f82e995(
  a: number,
  b: number,
  c: number,
): void;
export function _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h5666368b3099f94b(
  a: number,
  b: number,
): void;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_exn_store(a: number): void;
export function wasm_bindgen__convert__closures__invoke2_mut__h9ad06f9448a06267(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_thread_destroy(a: number, b: number): void;
export function __wbindgen_start(): void;