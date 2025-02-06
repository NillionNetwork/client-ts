/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_nadavalue_free: (a: number, b: number) => void;
export const nadavalue_new_secret_integer: (a: number, b: number, c: number) => void;
export const nadavalue_new_secret_unsigned_integer: (a: number, b: number, c: number) => void;
export const nadavalue_new_secret_boolean: (a: number, b: number) => void;
export const nadavalue_new_secret_blob: (a: number, b: number) => number;
export const nadavalue_new_public_integer: (a: number, b: number, c: number) => void;
export const nadavalue_new_public_unsigned_integer: (a: number, b: number, c: number) => void;
export const nadavalue_new_public_boolean: (a: number, b: number) => void;
export const nadavalue_new_ecdsa_private_key: (a: number, b: number, c: number) => void;
export const nadavalue_new_ecdsa_digest_message: (a: number, b: number, c: number) => void;
export const nadavalue_new_ecdsa_signature: (a: number, b: number, c: number, d: number, e: number) => void;
export const nadavalue_new_ecdsa_public_key: (a: number, b: number, c: number) => void;
export const nadavalue_new_store_id: (a: number, b: number, c: number) => void;
export const nadavalue_to_byte_array: (a: number, b: number) => void;
export const nadavalue_to_ecdsa_signature: (a: number, b: number) => void;
export const nadavalue_to_integer: (a: number, b: number) => void;
export const nadavalue_type_name: (a: number, b: number) => void;
export const __wbg_nadavalues_free: (a: number, b: number) => void;
export const nadavalues_new: (a: number) => void;
export const nadavalues_insert: (a: number, b: number, c: number, d: number) => void;
export const nadavalues_length: (a: number) => number;
export const nadavalues_to_record: (a: number, b: number) => void;
export const __wbg_ecdsasignature_free: (a: number, b: number) => void;
export const ecdsasignature_new: (a: number, b: number, c: number, d: number) => number;
export const ecdsasignature_r: (a: number) => number;
export const ecdsasignature_s: (a: number) => number;
export const __wbg_partyid_free: (a: number, b: number) => void;
export const partyid_new: (a: number, b: number) => number;
export const partyid_to_byte_array: (a: number) => number;
export const __wbg_encodedmodulo_free: (a: number, b: number) => void;
export const __wbg_secretmasker_free: (a: number, b: number) => void;
export const secretmasker_new_64_bit_safe_prime: (a: number, b: bigint, c: number, d: number) => void;
export const secretmasker_new_128_bit_safe_prime: (a: number, b: bigint, c: number, d: number) => void;
export const secretmasker_new_256_bit_safe_prime: (a: number, b: bigint, c: number, d: number) => void;
export const secretmasker_mask: (a: number, b: number, c: number) => void;
export const secretmasker_unmask: (a: number, b: number, c: number, d: number) => void;
export const secretmasker_classify_values: (a: number, b: number) => number;
export const secretmasker_modulo: (a: number) => number;
export const __wbg_nadavaluesclassification_free: (a: number, b: number) => void;
export const __wbg_get_nadavaluesclassification_shares: (a: number) => bigint;
export const __wbg_set_nadavaluesclassification_shares: (a: number, b: bigint) => void;
export const __wbg_get_nadavaluesclassification_public: (a: number) => bigint;
export const __wbg_set_nadavaluesclassification_public: (a: number, b: bigint) => void;
export const __wbg_get_nadavaluesclassification_ecdsa_private_key_shares: (a: number) => bigint;
export const __wbg_set_nadavaluesclassification_ecdsa_private_key_shares: (a: number, b: bigint) => void;
export const __wbg_get_nadavaluesclassification_ecdsa_signature_shares: (a: number) => bigint;
export const __wbg_set_nadavaluesclassification_ecdsa_signature_shares: (a: number, b: bigint) => void;
export const __wbg_partyshares_free: (a: number, b: number) => void;
export const partyshares_new: (a: number, b: number, c: number) => void;
export const partyshares_party: (a: number) => number;
export const partyshares_shares: (a: number) => number;
export const __wbg_encryptednadavalues_free: (a: number, b: number) => void;
export const encryptednadavalues_to_js_object: (a: number, b: number) => void;
export const encryptednadavalues_from_js_object: (a: number, b: number, c: number) => void;
export const __wbg_programmetadata_free: (a: number, b: number) => void;
export const programmetadata_new: (a: number, b: number, c: number) => void;
export const programmetadata_memory_size: (a: number) => bigint;
export const programmetadata_total_instructions: (a: number) => bigint;
export const programmetadata_instructions: (a: number, b: number) => void;
export const programmetadata_preprocessing_requirements: (a: number, b: number) => void;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_exn_store: (a: number) => void;
export const __wbindgen_add_to_stack_pointer: (a: number) => number;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
