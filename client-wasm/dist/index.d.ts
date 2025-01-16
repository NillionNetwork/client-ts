/* tslint:disable */
/* eslint-disable */
/**
* Encode a set of values.
* @param {EncryptedNadaValues} values
* @returns {Uint8Array}
*/
export function encode_values(values: EncryptedNadaValues): Uint8Array;
/**
* Decode a set of values.
* @param {Uint8Array} bincode_bytes
* @returns {EncryptedNadaValues}
*/
export function decode_values(bincode_bytes: Uint8Array): EncryptedNadaValues;
/**
* Compute the size of the given values.
* @param {NadaValues} values
* @returns {bigint}
*/
export function compute_values_size(values: NadaValues): bigint;
/**
* A ecdsa signature
*/
export class EcdsaSignature {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Construct a new instance the components.
* @param {Uint8Array} r
* @param {Uint8Array} s
*/
  constructor(r: Uint8Array, s: Uint8Array);
/**
* Access r component of the signature
* @returns {Uint8Array}
*/
  r(): Uint8Array;
/**
* Access s component of the signature
* @returns {Uint8Array}
*/
  s(): Uint8Array;
}
/**
* A set of encrypted nada values.
*/
export class EncryptedNadaValues {
  free(): void;
}
/**
* NadaValue
*
* This type represents a value in the Nillion network. This class provides utilities
* to encode numerical and binary values. It also provides methods to decode
* the value into a numerical form.
*
* @hideconstructor
*/
export class NadaValue {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Create a new secret integer value.
*
* @param {string} value - The value must be a valid string representation of an integer.
* @return {NadaValue} The encoded secret corresponding to the value provided
*
* @example
* const value = NadaValue.new_secret_integer("-23");
*/
  static new_secret_integer(value: string): NadaValue;
/**
* Create a new secret unsigned integer value.
*
* @param {string} value - The value must be a valid string representation of an unsigned integer.
* @return {NadaValue} The encoded secret corresponding to the value provided
*
* @example
* const value = NadaValue.new_secret_unsigned_integer("23");
*/
  static new_secret_unsigned_integer(value: string): NadaValue;
/**
* Create a new secret blob.
*
* @param {Uint8Array} value - The blob in binary (byte array) encoded format
* @return {NadaValue} The encoded secret corresponding to the value provided
*
* @example
* const value = NadaValue.new_secret_blob([1,0,1,222,21]);
*/
  static new_secret_blob(value: Uint8Array): NadaValue;
/**
* Create a new public integer with the provided value.
*
* @param {string} value - The value must be a valid string representation of an integer.
* @return {NadaValue} The encoded public variable corresponding to the value provided
*
* @example
* const value = NadaValue.new_public_integer("-23");
*/
  static new_public_integer(value: string): NadaValue;
/**
* Create a new public unsigned integer with the provided value.
*
* @param {string} value - The value must be a valid string representation of an unsigned integer.
* @return {NadaValue} The encoded public variable corresponding to the value provided
*
* @example
* const value = NadaValue.new_public_unsigned_integer("23");
*/
  static new_public_unsigned_integer(value: string): NadaValue;
/**
* Create a new ecdsa private key
*
* @param {Uint8Array} value - The ecdsa private key in binary (byte array) encoded format
* @return {NadaValue} The encoded secret corresponding to the value provided
*
* @example
* const value = NadaValue.new_ecdsa_private_key([1,0,1,222,21,...]);
*/
  static new_ecdsa_private_key(value: Uint8Array): NadaValue;
/**
* Create a new ecdsa digest message.
*
* @param {Uint8Array} value - The ecdsa digest message in binary (byte array) encoded format
* @return {NadaValue} The encoded secret corresponding to the value provided
*
* @example
* const value = NadaValue.new_ecdsa_digest_message([1,0,1,222,21,...]);
*/
  static new_ecdsa_digest_message(value: Uint8Array): NadaValue;
/**
* Create a new ecdsa signature.
*
* @param {Uint8Array} r - The r component of the signature in binary (byte array) encoded format
* @param {Uint8Array} s - The s component of the signature in binary (byte array) encoded format
* @return {NadaValue} The encoded secret corresponding to the value provided
*
* @example
* const value = NadaValue::new_ecdsa_signature(EcdsaSignature { r, s });
*/
  static new_ecdsa_signature(r: Uint8Array, s: Uint8Array): NadaValue;
/**
* Convert this value into a byte array.
*
* This is only valid for secret blob values.
* @return {Uint8Array} the byte array contained in this value.
* @throws {Error} if the value is not a secret blob.
*
* @example
* const value = NadaValue.new_secret_blob([1,0,1,222,21]);
* const byteArray = value.to_byte_array();
*/
  to_byte_array(): Uint8Array;
/**
* Convert this NadaValue into an EcdsaSignature.
*
* This is only valid for EcdsaSignature.
* @return {Uint8Array} the byte array contained in this value.
* @throws {Error} if the value is not a secret blob.
*
* @example
* const value = NadaValue.new_ecdsa_signature([1,0,1,222,21], [1,0,1,222,21]);
* const signature = value.to_ecdsa_signature();
*/
  to_ecdsa_signature(): EcdsaSignature;
/**
* Convert this value into a string representation of the underlying numeric value.
*
* This only works for numeric secret values, such as integers and unsigned integers.
* @return {string} a string representation of the underlying numeric value
*
* @example
* const value = NadaValue.new_public_integer("23");
* const integer_value = value.to_integer();
*/
  to_integer(): string;
/**
* Return the Nada type represented by this instance.
*
* @example
* const value = NadaValue.new_secret_integer("42");
* console.log(value.type()); // "SecretInteger"
*/
  type_name(): string;
}
/**
* A collection of named values.
*/
export class NadaValues {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Creates a new empty instance of NadaValues.
*
* @example
* const values = new NadaValues();
*/
  constructor();
/**
* Add an encoded value to the NadaValues collection.
*
* @param {string} name - The name of the value
* @param {NadaValue} input - The value to be added
*
* @example
* values.insert("my_value", NadaValue.new_public_integer("23"));
*/
  insert(name: string, input: NadaValue): void;
/**
* Convert NadaValues into a JS object
*
* @example
* const nadaValues = new NadaValues();
* nadaValues.insert("foo", NadaValue::new_secret_integer("42"));
* const values = nadaValues.to_record();
* console.log(values); // { foo: { type: "SecretInteger", value: "42" } }
* @returns {any}
*/
  to_record(): any;
/**
* Get the number of values.
*
* @example
* const length = values.length;
*/
  readonly length: number;
}
/**
* The classification of a set of nada values.
*/
export class NadaValuesClassification {
  free(): void;
/**
* The number of ecdsa key shares
*/
  ecdsa_private_key_shares: bigint;
/**
* The number of ecdsa signatures shares
*/
  ecdsa_signature_shares: bigint;
/**
* The number of public values
*/
  public: bigint;
/**
* The number of shares
*/
  shares: bigint;
}
/**
* A party identifier.
*/
export class PartyId {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Construct a new instance using the given identifier.
* @param {Uint8Array} id
*/
  constructor(id: Uint8Array);
/**
* Access party id's underlying bytes.
* @returns {Uint8Array}
*/
  to_byte_array(): Uint8Array;
}
/**
* The shares for a party.
*/
export class PartyShares {
  free(): void;
/**
* Construct a PartyShares instance with the values provided.
* @param {PartyId} party
* @param {EncryptedNadaValues} shares
*/
  constructor(party: PartyId, shares: EncryptedNadaValues);
/**
* Get the party this shares are for.
*/
  readonly party: PartyId;
/**
* Get the shares.
*/
  readonly shares: EncryptedNadaValues;
}
/**
* The metadata for a nada program.
*/
export class ProgramMetadata {
  free(): void;
/**
* Construct a program metadata out of a serialized program.
* @param {Uint8Array} program
*/
  constructor(program: Uint8Array);
/**
* The program memory size.
* @returns {bigint}
*/
  memory_size(): bigint;
/**
* The total number of instructions.
* @returns {bigint}
*/
  total_instructions(): bigint;
/**
* The program instructions.
* @returns {any}
*/
  instructions(): any;
/**
* The program preprocessing requirements.
* @returns {any}
*/
  preprocessing_requirements(): any;
}
/**
* A secret masker.
*
* This allows masking and unmasking secrets.
*/
export class SecretMasker {
  free(): void;
/**
* Construct a new masker that uses a 64 bit safe prime under the hood.
* @param {bigint} polynomial_degree
* @param {(PartyId)[]} parties
* @returns {SecretMasker}
*/
  static new_64_bit_safe_prime(polynomial_degree: bigint, parties: (PartyId)[]): SecretMasker;
/**
* Construct a new masker that uses a 128 bit safe prime under the hood.
* @param {bigint} polynomial_degree
* @param {(PartyId)[]} parties
* @returns {SecretMasker}
*/
  static new_128_bit_safe_prime(polynomial_degree: bigint, parties: (PartyId)[]): SecretMasker;
/**
* Construct a new masker that uses a 256 bit safe prime under the hood.
* @param {bigint} polynomial_degree
* @param {(PartyId)[]} parties
* @returns {SecretMasker}
*/
  static new_256_bit_safe_prime(polynomial_degree: bigint, parties: (PartyId)[]): SecretMasker;
/**
* Mask a set of values.
* @param {NadaValues} values
* @returns {(PartyShares)[]}
*/
  mask(values: NadaValues): (PartyShares)[];
/**
* Unmask a set of encrypted values.
* @param {(PartyShares)[]} shares
* @returns {NadaValues}
*/
  unmask(shares: (PartyShares)[]): NadaValues;
/**
* Classify the given cleartext values.
*
* This allows getting the totals per value type which is a required parameter when storing values.
* @param {NadaValues} values
* @returns {NadaValuesClassification}
*/
  classify_values(values: NadaValues): NadaValuesClassification;
}
