//! NadaValues.
use crate::errors::{JsResult, ValueError};
use js_sys::{Array, Object, Uint8Array};
use nillion_client_core::{
    generic_ec::{curves::Secp256k1, serde::CurveName, Curve, NonZero, Point, Scalar, SecretScalar},
    key_share::{DirtyCoreKeyShare, DirtyKeyInfo, Validate},
    privatekey::{ThresholdPrivateKey, ThresholdPrivateKeyShare},
    publickey::EcdsaPublicKeyArray,
    signature,
    signature::EcdsaSignatureShare,
    values::{BigInt, BigUint, BlobPrimitiveType, Clear, Encoded, EncodedModularNumber, Encrypted, PartyJar},
};
use std::{collections::HashMap, str::FromStr};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

/// NadaValue
///
/// This type represents a value in the Nillion network. This class provides utilities
/// to encode numerical and binary values. It also provides methods to decode
/// the value into a numerical form.
///
/// @hideconstructor
#[wasm_bindgen(inspectable)]
#[cfg_attr(test, derive(Debug, Clone, PartialEq))]
pub struct NadaValue(pub(crate) nillion_client_core::values::NadaValue<Clear>);

#[wasm_bindgen]
impl NadaValue {
    /// Create a new secret integer value.
    ///
    /// @param {string} value - The value must be a valid string representation of an integer.
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_secret_integer("-23");
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_secret_integer(value: &str) -> JsResult<NadaValue> {
        let value: BigInt = value.parse().map_err(|e| ValueError::new_err(&format!("Invalid integer value: {e}")))?;
        let value = nillion_client_core::values::NadaValue::new_secret_integer(value);
        Ok(Self(value))
    }

    /// Create a new secret unsigned integer value.
    ///
    /// @param {string} value - The value must be a valid string representation of an unsigned integer.
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_secret_unsigned_integer("23");
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_secret_unsigned_integer(value: &str) -> JsResult<NadaValue> {
        let value: BigUint =
            value.parse().map_err(|e| ValueError::new_err(&format!("Invalid unsigned integer value: {e}")))?;
        let value = nillion_client_core::values::NadaValue::new_secret_unsigned_integer(value);
        Ok(Self(value))
    }

    /// Create a new secret boolean value.
    ///
    /// @param {string} value - The value must be a valid string representation of boolean.
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_secret_boolean(true);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_secret_boolean(value: bool) -> JsResult<NadaValue> {
        let value = nillion_client_core::values::NadaValue::new_secret_boolean(value);
        Ok(Self(value))
    }

    /// Create a new secret blob.
    ///
    /// @param {Uint8Array} value - The blob in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_secret_blob([1,0,1,222,21]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_secret_blob(value: Vec<u8>) -> NadaValue {
        let secret = nillion_client_core::values::NadaValue::new_secret_blob(value);
        Self(secret)
    }

    /// Create a new public integer with the provided value.
    ///
    /// @param {string} value - The value must be a valid string representation of an integer.
    /// @return {NadaValue} The encoded public variable corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_public_integer("-23");
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_public_integer(value: &str) -> JsResult<NadaValue> {
        let value: BigInt = value.parse().map_err(|e| ValueError::new_err(&format!("Invalid integer value: {e}")))?;
        let value = nillion_client_core::values::NadaValue::new_integer(value);
        Ok(Self(value))
    }

    /// Create a new public unsigned integer with the provided value.
    ///
    /// @param {string} value - The value must be a valid string representation of an unsigned integer.
    /// @return {NadaValue} The encoded public variable corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_public_unsigned_integer("23");
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_public_unsigned_integer(value: &str) -> JsResult<NadaValue> {
        let value: BigUint =
            value.parse().map_err(|e| ValueError::new_err(&format!("Invalid unsigned integer value: {e}")))?;
        let value = nillion_client_core::values::NadaValue::new_unsigned_integer(value);
        Ok(Self(value))
    }

    /// Create a new public boolean value.
    ///
    /// @param {string} value - The value must be a valid string representation of boolean.
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_public_boolean(true);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_public_boolean(value: bool) -> JsResult<NadaValue> {
        let value = nillion_client_core::values::NadaValue::new_boolean(value);
        Ok(Self(value))
    }

    /// Create a new ecdsa private key
    ///
    /// @param {Uint8Array} value - The ecdsa private key in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_ecdsa_private_key([1,0,1,222,21,...]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_ecdsa_private_key(value: Vec<u8>) -> JsResult<NadaValue> {
        let private_key = ThresholdPrivateKey::from_be_bytes(&value)
            .map_err(|e| ValueError::new_err(&format!("Invalid ecdsa private key: {e}")))?;
        let secret = nillion_client_core::values::NadaValue::new_ecdsa_private_key(private_key);
        Ok(Self(secret))
    }

    /// Create a new ecdsa digest message.
    ///
    /// @param {Uint8Array} value - The ecdsa digest message in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_ecdsa_digest_message([1,0,1,222,21,...]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_ecdsa_digest_message(value: Vec<u8>) -> JsResult<NadaValue> {
        let array: [u8; 32] =
            value.try_into().map_err(|_| ValueError::new_err("Message digest must be exactly 32 bytes long"))?;
        let secret = nillion_client_core::values::NadaValue::new_ecdsa_digest_message(array);
        Ok(Self(secret))
    }

    /// Create a new ecdsa signature.
    ///
    /// @param {Uint8Array} r - The r component of the signature in binary (byte array) encoded format
    /// @param {Uint8Array} s - The s component of the signature in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue::new_ecdsa_signature(EcdsaSignature { r, s });
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_ecdsa_signature(r: Vec<u8>, s: Vec<u8>) -> JsResult<NadaValue> {
        let r = try_into_scalar(&r, "r")?;
        let s = try_into_scalar(&s, "s")?;
        Ok(Self(nillion_client_core::values::NadaValue::new_ecdsa_signature(signature::EcdsaSignature { r, s })))
    }

    /// Create a new ecdsa public key.
    ///
    /// @param {Uint8Array} value - The value component of the public key in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue::new_ecdsa_public_key([0, 12, ..., 12]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_ecdsa_public_key(value: Vec<u8>) -> JsResult<NadaValue> {
        let array: [u8; 33] =
            value.try_into().map_err(|_| ValueError::new_err("Public key must be exactly 33 bytes long"))?;
        Ok(Self(nillion_client_core::values::NadaValue::new_ecdsa_public_key::<EcdsaPublicKeyArray>(array.into())))
    }

    /// Create a new eddsa private key
    ///
    /// @param {Uint8Array} value - The ecdsa private key in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_eddsa_private_key([1,0,1,222,21,...]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_eddsa_private_key(value: Vec<u8>) -> JsResult<NadaValue> {
        let private_key = ThresholdPrivateKey::from_le_bytes(&value)
            .map_err(|e| ValueError::new_err(&format!("Invalid eddsa private key: {e}")))?;
        let secret = nillion_client_core::values::NadaValue::new_eddsa_private_key(private_key);
        Ok(Self(secret))
    }

    /// Create a new eddsa message.
    ///
    /// @param {Uint8Array} value - The eddsa digest message in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue.new_eddsa_message([1,0,1,222,21,...]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_eddsa_message(value: Vec<u8>) -> JsResult<NadaValue> {
        Ok(Self(nillion_client_core::values::NadaValue::new_eddsa_message(value)))
    }

    /// Create a new eddsa signature.
    ///
    /// @param {Uint8Array} r - The r component of the signature in binary (byte array) encoded format
    /// @param {Uint8Array} z - The z component of the signature in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue::new_eddsa_signature(EddsaSignature { r, z });
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_eddsa_signature(r: Vec<u8>, z: Vec<u8>) -> JsResult<NadaValue> {
        let signature = signature::EddsaSignature::from_components_bytes(&r, &z)
            .map_err(|e| ValueError::new_err(&format!("Invalid eddsa signature: {e}")))?;
        Ok(Self(nillion_client_core::values::NadaValue::new_eddsa_signature(signature)))
    }

    /// Create a new eddsa public key.
    ///
    /// @param {Uint8Array} value - The value component of the public key in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue::new_eddsa_public_key([0, 12, ..., 12]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_eddsa_public_key(value: Vec<u8>) -> JsResult<NadaValue> {
        let array: [u8; 32] =
            value.try_into().map_err(|_| ValueError::new_err("Public key must be exactly 32 bytes long"))?;
        Ok(Self(nillion_client_core::values::NadaValue::new_eddsa_public_key(array)))
    }

    /// Create a store id.
    ///
    /// @param {Uint8Array} value - The value component of the store id in binary (byte array) encoded format
    /// @return {NadaValue} The encoded secret corresponding to the value provided
    ///
    /// @example
    /// const value = NadaValue::new_store_id([0, 12, ..., 12]);
    #[wasm_bindgen(skip_jsdoc)]
    pub fn new_store_id(value: Vec<u8>) -> JsResult<NadaValue> {
        let array: [u8; 16] =
            value.try_into().map_err(|_| ValueError::new_err("Store id must be exactly 16 bytes long"))?;
        Ok(Self(nillion_client_core::values::NadaValue::new_store_id(array)))
    }

    /// Convert this value into a byte array.
    ///
    /// This is only valid for secret blob values.
    /// @return {Uint8Array} the byte array contained in this value.
    /// @throws {Error} if the value is not a secret blob.
    ///
    /// @example
    /// const value = NadaValue.new_secret_blob([1,0,1,222,21]);
    /// const byteArray = value.to_byte_array();
    #[wasm_bindgen(skip_jsdoc)]
    pub fn to_byte_array(&self) -> Result<Vec<u8>, JsError> {
        match &self.0 {
            nillion_client_core::values::NadaValue::SecretBlob(v) => Ok(v.to_vec()),
            nillion_client_core::values::NadaValue::EcdsaPrivateKey(v) => Ok(v.clone().to_be_bytes()),
            nillion_client_core::values::NadaValue::EcdsaDigestMessage(v) => Ok(v.into()),
            nillion_client_core::values::NadaValue::EcdsaPublicKey(v) => Ok(v.0.into()),
            nillion_client_core::values::NadaValue::EddsaPrivateKey(v) => Ok(v.clone().to_le_bytes()),
            nillion_client_core::values::NadaValue::EddsaPublicKey(v) => Ok(v.into()),
            nillion_client_core::values::NadaValue::EddsaMessage(v) => Ok(v.to_vec()),
            nillion_client_core::values::NadaValue::StoreId(store_id) => Ok(store_id.into()),
            _ => Err(JsError::new("value does not contain a byte array")),
        }
    }

    /// Convert this NadaValue into an EcdsaSignature.
    ///
    /// This is only valid for EcdsaSignature.
    /// @return {Uint8Array} the byte array contained in this value.
    /// @throws {Error} if the value is not a ecdsa signature
    ///
    /// @example
    /// const value = NadaValue.new_ecdsa_signature([1,0,1,222,21], [1,0,1,222,21]);
    /// const signature = value.to_ecdsa_signature();
    #[wasm_bindgen(skip_jsdoc)]
    pub fn to_ecdsa_signature(&self) -> Result<EcdsaSignature, JsError> {
        if let nillion_client_core::values::NadaValue::EcdsaSignature(signature) = &self.0 {
            let signature::EcdsaSignature { r, s } = signature;
            let r = Scalar::to_be_bytes(r).to_vec();
            let s = Scalar::to_be_bytes(s).to_vec();
            Ok(EcdsaSignature::new(r, s))
        } else {
            Err(JsError::new("value is not a ecdsa signature"))
        }
    }

    /// Convert this NadaValue into an EddsaSignature.
    ///
    /// This is only valid for EddsaSignature.
    /// @return {Uint8Array} the byte array contained in this value.
    /// @throws {Error} if the value is not a eddsa signature
    ///
    /// @example
    /// const value = NadaValue.new_eddsa_signature([1,0,1,222,21], [1,0,1,222,21]);
    /// const signature = value.to_eddsa_signature();
    #[wasm_bindgen(skip_jsdoc)]
    pub fn to_eddsa_signature(&self) -> Result<EddsaSignature, JsError> {
        if let nillion_client_core::values::NadaValue::EddsaSignature(signature) = &self.0 {
            let r = signature.signature.r.to_bytes().as_bytes().to_vec();
            let z = signature.signature.z.to_le_bytes().to_vec();
            Ok(EddsaSignature::new(r, z))
        } else {
            Err(JsError::new("value is not a eddsa signature"))
        }
    }

    /// Convert this value into a string representation of the underlying numeric value.
    ///
    /// This only works for numeric secret values, such as integers and unsigned integers.
    /// @return {string} a string representation of the underlying numeric value
    ///
    /// @example
    /// const value = NadaValue.new_public_integer("23");
    /// const integer_value = value.to_integer();
    #[wasm_bindgen(skip_jsdoc)]
    pub fn to_integer(&self) -> Result<String, JsError> {
        use nillion_client_core::values::NadaValue::*;

        match &self.0 {
            SecretInteger(value) | Integer(value) => Ok(value.to_string()),
            UnsignedInteger(value) | SecretUnsignedInteger(value) => Ok(value.to_string()),
            Boolean(value) | SecretBoolean(value) => Ok(value.to_string()),
            _ => Err(JsError::new("value is not a number")),
        }
    }

    /// Return the Nada type represented by this instance.
    ///
    /// @example
    /// const value = NadaValue.new_secret_integer("42");
    /// console.log(value.type()); // "SecretInteger"
    #[wasm_bindgen(skip_jsdoc)]
    pub fn type_name(&self) -> JsResult<String> {
        use nillion_client_core::values::NadaValue::*;
        let type_str = match self.0 {
            Integer(_) => "PublicInteger",
            UnsignedInteger(_) => "PublicUnsignedInteger",
            Boolean(_) => "PublicBoolean",
            SecretInteger(_) => "SecretInteger",
            SecretUnsignedInteger(_) => "SecretUnsignedInteger",
            SecretBoolean(_) => "SecretBoolean",
            SecretBlob(_) => "SecretBlob",
            EcdsaPrivateKey(_) => "EcdsaPrivateKey",
            EcdsaDigestMessage(_) => "EcdsaDigestMessage",
            EcdsaSignature(_) => "EcdsaSignature",
            EcdsaPublicKey(_) => "EcdsaPublicKey",
            EddsaPrivateKey(_) => "EddsaPrivateKey",
            EddsaMessage(_) => "EddsaMessage",
            EddsaSignature(_) => "EddsaSignature",
            EddsaPublicKey(_) => "EddsaPublicKey",
            StoreId(_) => "StoreId",
            _ => Err(JsError::new(&format!("Unsupported type {:?}", self.0)))?,
        };
        Ok(type_str.into())
    }
}

fn try_into_scalar(bytes: &[u8], parameter: &str) -> JsResult<NonZero<Scalar<Secp256k1>>> {
    let scalar = Scalar::from_be_bytes(bytes).map_err(|_| ValueError::new_err(&format!("Ecdsa signature parameter {parameter}: Format error as the encoded integer is larger than group order. Note that byte representation should be in big-endian format.")))?;
    NonZero::from_scalar(scalar)
        .ok_or_else(|| ValueError::new_err(&format!("Ecdsa signature parameter {parameter}: value cannot be 0")))
}

/// A collection of named values.
#[wasm_bindgen(inspectable)]
#[cfg_attr(test, derive(Debug, Clone, PartialEq))]
pub struct NadaValues(pub(crate) HashMap<String, nillion_client_core::values::NadaValue<Clear>>);

#[wasm_bindgen]
impl NadaValues {
    /// Creates a new empty instance of NadaValues.
    ///
    /// @example
    /// const values = new NadaValues();
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new() -> JsResult<NadaValues> {
        Ok(Self(Default::default()))
    }

    /// Add an encoded value to the NadaValues collection.
    ///
    /// @param {string} name - The name of the value
    /// @param {NadaValue} input - The value to be added
    ///
    /// @example
    /// values.insert("my_value", NadaValue.new_public_integer("23"));
    #[wasm_bindgen(skip_jsdoc)]
    pub fn insert(&mut self, name: String, input: &NadaValue) {
        self.0.insert(name, input.0.clone());
    }

    /// Get the number of values.
    ///
    /// @example
    /// const length = values.length;
    #[wasm_bindgen(getter)]
    pub fn length(&self) -> usize {
        self.0.len()
    }

    /// Convert NadaValues into a JS object
    ///
    /// @example
    /// const nadaValues = new NadaValues();
    /// nadaValues.insert("foo", NadaValue::new_secret_integer("42"));
    /// const values = nadaValues.to_record();
    /// console.log(values); // { foo: { type: "SecretInteger", value: "42" } }
    #[wasm_bindgen]
    pub fn to_record(&self) -> JsResult<JsValue> {
        let js_obj = Object::new();
        for (name, value) in &self.0 {
            let inner_obj = Object::new();

            let wrapped = NadaValue(value.clone());
            let nada_type = wrapped.type_name()?;

            js_sys::Reflect::set(&inner_obj, &JsValue::from("type"), &JsValue::from(&nada_type))
                .map_err(|e| JsError::new(&format!("Failed to set type: {:?}", e)))?;

            let js_value = match value {
                nillion_client_core::values::NadaValue::SecretBlob(_)
                | nillion_client_core::values::NadaValue::EcdsaPrivateKey(_)
                | nillion_client_core::values::NadaValue::EcdsaDigestMessage(_)
                | nillion_client_core::values::NadaValue::EcdsaPublicKey(_)
                | nillion_client_core::values::NadaValue::EddsaPrivateKey(_)
                | nillion_client_core::values::NadaValue::EddsaMessage(_)
                | nillion_client_core::values::NadaValue::EddsaPublicKey(_)
                | nillion_client_core::values::NadaValue::StoreId(_) => {
                    let byte_array = wrapped.to_byte_array()?;
                    let uint8_array = to_byte_array(&byte_array);
                    JsValue::from(uint8_array)
                }
                nillion_client_core::values::NadaValue::EcdsaSignature(_) => {
                    JsValue::from(wrapped.to_ecdsa_signature()?)
                }
                nillion_client_core::values::NadaValue::EddsaSignature(_) => {
                    JsValue::from(wrapped.to_eddsa_signature()?)
                }
                _ => JsValue::from(wrapped.to_integer()?),
            };

            js_sys::Reflect::set(&inner_obj, &JsValue::from("value"), &js_value)
                .map_err(|e| JsError::new(&format!("Failed to set value: {:?}", e)))?;

            js_sys::Reflect::set(&js_obj, &JsValue::from(name), &JsValue::from(inner_obj))
                .map_err(|e| JsError::new(&format!("Failed to set property: {:?}", e)))?;
        }
        Ok(JsValue::from(js_obj))
    }
}

/// A ecdsa signature
#[wasm_bindgen(inspectable)]
#[derive(Clone)]
pub struct EcdsaSignature {
    /// r component of the signature in binary format
    r: Vec<u8>,
    /// s component of the signature in binary format
    s: Vec<u8>,
}

#[wasm_bindgen]
impl EcdsaSignature {
    /// Construct a new instance the components.
    #[wasm_bindgen(constructor)]
    pub fn new(r: Vec<u8>, s: Vec<u8>) -> Self {
        Self { r, s }
    }

    /// Access r component of the signature
    pub fn r(&self) -> Uint8Array {
        to_byte_array(&self.r)
    }

    /// Access s component of the signature
    pub fn s(&self) -> Uint8Array {
        to_byte_array(&self.s)
    }
}

/// A eddsa signature
#[wasm_bindgen(inspectable)]
#[derive(Clone)]
pub struct EddsaSignature {
    /// r component of the signature in binary format
    r: Vec<u8>,
    /// z component of the signature in binary format
    z: Vec<u8>,
}

#[wasm_bindgen]
impl EddsaSignature {
    /// Construct a new instance the components.
    #[wasm_bindgen(constructor)]
    pub fn new(r: Vec<u8>, z: Vec<u8>) -> Self {
        Self { r, z }
    }

    /// Access r component of the signature
    pub fn r(&self) -> Uint8Array {
        to_byte_array(&self.r)
    }

    /// Access z component of the signature
    pub fn z(&self) -> Uint8Array {
        to_byte_array(&self.z)
    }

    /// Access value of the signature
    pub fn signature(&self) -> Uint8Array {
        let mut signature = self.r.clone();
        signature.append(&mut self.z.clone());
        to_byte_array(&signature)
    }
}

/// A party identifier.
#[wasm_bindgen(inspectable)]
#[derive(Clone)]
pub struct PartyId(Vec<u8>);

#[wasm_bindgen]
impl PartyId {
    /// Construct a new instance using the given identifier.
    #[wasm_bindgen(constructor)]
    pub fn new(id: Vec<u8>) -> Self {
        Self(id)
    }

    /// Access party id's underlying bytes.
    pub fn to_byte_array(&self) -> Uint8Array {
        to_byte_array(&self.0)
    }
}

/// Access party id's underlying bytes.
pub fn to_byte_array(bytes: &[u8]) -> Uint8Array {
    let uint8_array = Uint8Array::new_with_length(bytes.len() as u32);
    uint8_array.copy_from(bytes);
    uint8_array
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub struct EncodedModulo(nillion_client_core::values::EncodedModulo);

/// A secret masker.
///
/// This allows masking and unmasking secrets.
#[wasm_bindgen]
pub struct SecretMasker(nillion_client_core::values::SecretMasker, EncodedModulo);

#[wasm_bindgen]
impl SecretMasker {
    /// Construct a new masker that uses a 64 bit safe prime under the hood.
    pub fn new_64_bit_safe_prime(polynomial_degree: u64, parties: Vec<PartyId>) -> JsResult<SecretMasker> {
        let parties = parties.into_iter().map(|p| nillion_client_core::values::PartyId::from(p.0)).collect();
        let masker = nillion_client_core::values::SecretMasker::new_64_bit_safe_prime(polynomial_degree, parties)
            .map_err(|e| ValueError::new_err(&format!("failed to create secret masker: {e}")))?;
        Ok(Self(masker, EncodedModulo(nillion_client_core::values::EncodedModulo::U64SafePrime)))
    }

    /// Construct a new masker that uses a 128 bit safe prime under the hood.
    pub fn new_128_bit_safe_prime(polynomial_degree: u64, parties: Vec<PartyId>) -> JsResult<SecretMasker> {
        let parties = parties.into_iter().map(|p| nillion_client_core::values::PartyId::from(p.0)).collect();
        let masker = nillion_client_core::values::SecretMasker::new_128_bit_safe_prime(polynomial_degree, parties)
            .map_err(|e| ValueError::new_err(&format!("failed to create secret masker: {e}")))?;
        Ok(Self(masker, EncodedModulo(nillion_client_core::values::EncodedModulo::U128SafePrime)))
    }

    /// Construct a new masker that uses a 256 bit safe prime under the hood.
    pub fn new_256_bit_safe_prime(polynomial_degree: u64, parties: Vec<PartyId>) -> JsResult<SecretMasker> {
        let parties = parties.into_iter().map(|p| nillion_client_core::values::PartyId::from(p.0)).collect();
        let masker = nillion_client_core::values::SecretMasker::new_256_bit_safe_prime(polynomial_degree, parties)
            .map_err(|e| ValueError::new_err(&format!("failed to create secret masker: {e}")))?;
        Ok(Self(masker, EncodedModulo(nillion_client_core::values::EncodedModulo::U256SafePrime)))
    }

    /// Mask a set of values.
    pub fn mask(&self, values: NadaValues) -> JsResult<Vec<PartyShares>> {
        let shares = self.0.mask(values.0).map_err(|e| ValueError::new_err(&format!("failed to mask values: {e}")))?;
        let shares = shares
            .into_iter()
            .map(|(party, shares)| PartyShares {
                party: PartyId(party.as_ref().to_vec()),
                shares: EncryptedNadaValues(shares),
            })
            .collect();
        Ok(shares)
    }

    /// Unmask a set of encrypted values.
    pub fn unmask(&self, shares: Vec<PartyShares>) -> JsResult<NadaValues> {
        let shares = shares.into_iter().map(|party_shares| {
            (nillion_client_core::values::PartyId::from(party_shares.party.0), party_shares.shares.0)
        });
        let jar = PartyJar::new_with_elements(shares)
            .map_err(|e| ValueError::new_err(&format!("failed to unmask shares: {e}")))?;
        let values = self.0.unmask(jar).map_err(|e| ValueError::new_err(&format!("failed to unmask shares: {e}")))?;
        Ok(NadaValues(values))
    }

    /// Classify the given cleartext values.
    ///
    /// This allows getting the totals per value type which is a required parameter when storing values.
    pub fn classify_values(&self, values: &NadaValues) -> NadaValuesClassification {
        let nillion_client_core::values::NadaValuesClassification {
            shares,
            public,
            ecdsa_private_key_shares,
            ecdsa_signature_shares,
        } = self.0.classify_values(&values.0);
        NadaValuesClassification { shares, public, ecdsa_private_key_shares, ecdsa_signature_shares }
    }

    pub fn modulo(&self) -> EncodedModulo {
        self.1
    }
}

/// The classification of a set of nada values.
#[wasm_bindgen]
pub struct NadaValuesClassification {
    /// The number of shares
    pub shares: u64,

    /// The number of public values
    pub public: u64,

    /// The number of ecdsa key shares
    pub ecdsa_private_key_shares: u64,

    /// The number of ecdsa signatures shares
    pub ecdsa_signature_shares: u64,
}

/// The shares for a party.
#[wasm_bindgen]
pub struct PartyShares {
    party: PartyId,
    shares: EncryptedNadaValues,
}

#[wasm_bindgen]
impl PartyShares {
    /// Construct a PartyShares instance with the values provided.
    #[wasm_bindgen(constructor)]
    pub fn new(party: PartyId, shares: EncryptedNadaValues) -> JsResult<PartyShares> {
        Ok(PartyShares { party, shares })
    }

    /// Get the party this shares are for.
    #[wasm_bindgen(getter)]
    pub fn party(&self) -> PartyId {
        self.party.clone()
    }

    /// Get the shares.
    #[wasm_bindgen(getter)]
    pub fn shares(&self) -> EncryptedNadaValues {
        self.shares.clone()
    }
}

/// A set of encrypted nada values.
#[wasm_bindgen]
#[derive(Clone)]
#[cfg_attr(test, derive(Debug, PartialEq))]
pub struct EncryptedNadaValues(HashMap<String, nillion_client_core::values::NadaValue<Encrypted<Encoded>>>);

#[wasm_bindgen]
impl EncryptedNadaValues {
    /// Convert EncryptedNadaValues into a JS object
    #[wasm_bindgen]
    pub fn to_js_object(&self) -> JsResult<JsValue> {
        let js_obj = Object::new();
        for (name, nada_value) in &self.0 {
            let inner_obj = Object::new();
            let nada_type = nada_value.to_type().to_string();

            js_sys::Reflect::set(&inner_obj, &JsValue::from("type"), &JsValue::from(&nada_type))
                .map_err(|e| JsError::new(&format!("Failed to set type: {:?}", e)))?;

            use nillion_client_core::values::NadaValue as CoreNadaValue;
            match nada_value {
                CoreNadaValue::Integer(value)
                | CoreNadaValue::UnsignedInteger(value)
                | CoreNadaValue::Boolean(value) => {
                    let js_value = JsValue::from(to_byte_array(value.as_bytes()));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("value"), &js_value)
                        .map_err(|_| JsError::new("Failed to set value"))?;
                }

                CoreNadaValue::ShamirShareInteger(value)
                | CoreNadaValue::ShamirShareUnsignedInteger(value)
                | CoreNadaValue::ShamirShareBoolean(value) => {
                    let js_value = JsValue::from(to_byte_array(value.as_bytes()));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("value"), &js_value)
                        .map_err(|_| JsError::new("Failed to set value"))?;
                }

                CoreNadaValue::SecretBlob(value) => {
                    let shares = value
                        .value
                        .iter()
                        .map(|share| JsValue::from(to_byte_array(share.as_bytes())))
                        .collect::<Array>();
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("shares"), &shares)
                        .map_err(|_| JsError::new("Failed to set shares"))?;

                    let js_original_size = JsValue::from(value.unencoded_size.to_string());
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("originalSize"), &js_original_size)
                        .map_err(|_| JsError::new("Failed to set originalSize"))?;
                }
                CoreNadaValue::EcdsaPrivateKey(value) => {
                    Self::private_key_to_json(&inner_obj, value)?;
                }
                CoreNadaValue::EcdsaDigestMessage(value) => {
                    let js_value = JsValue::from(to_byte_array(value));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("digest"), &js_value)
                        .map_err(|_| JsError::new("Failed to set digest"))?;
                }
                CoreNadaValue::EcdsaSignature(value) => {
                    let r = value.r.clone().to_le_bytes();
                    let js_r = JsValue::from(to_byte_array(&r));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("r"), &js_r)
                        .map_err(|_| JsError::new("Failed to set r"))?;

                    let sigma = value.sigma.clone().to_le_bytes();
                    let js_sigma = JsValue::from(to_byte_array(&sigma));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("sigma"), &js_sigma)
                        .map_err(|_| JsError::new("Failed to set sigma"))?;
                }
                CoreNadaValue::EcdsaPublicKey(value) => {
                    let js_public_key = JsValue::from(to_byte_array(&value.0));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("publicKey"), &js_public_key)
                        .map_err(|_| JsError::new("Failed to set publicKey"))?;
                }
                CoreNadaValue::EddsaPrivateKey(value) => {
                    Self::private_key_to_json(&inner_obj, value)?;
                }
                CoreNadaValue::EddsaMessage(value) => {
                    let js_value = JsValue::from(to_byte_array(value));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("message"), &js_value)
                        .map_err(|_| JsError::new("Failed to set message"))?;
                }
                CoreNadaValue::EddsaSignature(value) => {
                    let signature = value.to_bytes();
                    let js_signature = JsValue::from(to_byte_array(&signature));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("signature"), &js_signature)
                        .map_err(|_| JsError::new("Failed to set signature"))?;
                }
                CoreNadaValue::EddsaPublicKey(value) => {
                    let js_public_key = JsValue::from(to_byte_array(value));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("publicKey"), &js_public_key)
                        .map_err(|_| JsError::new("Failed to set publicKey"))?;
                }
                CoreNadaValue::StoreId(store_id) => {
                    let js_store_id = JsValue::from(to_byte_array(store_id));
                    js_sys::Reflect::set(&inner_obj, &JsValue::from("storeId"), &js_store_id)
                        .map_err(|_| JsError::new("Failed to set value"))?;
                }
                CoreNadaValue::SecretInteger(_)
                | CoreNadaValue::SecretUnsignedInteger(_)
                | CoreNadaValue::SecretBoolean(_)
                | CoreNadaValue::NTuple { .. }
                | CoreNadaValue::Object { .. }
                | CoreNadaValue::Array { .. }
                | CoreNadaValue::Tuple { .. } => {
                    return Err(JsError::new(&format!("Type {} can not be converted to protobuf", nada_type)));
                }
            };

            js_sys::Reflect::set(&js_obj, &JsValue::from(name), &JsValue::from(inner_obj))
                .map_err(|e| JsError::new(&format!("Failed to set property: {:?}", e)))?;
        }
        Ok(JsValue::from(js_obj))
    }

    fn private_key_to_json<T: Curve>(obj: &Object, private_key: &ThresholdPrivateKeyShare<T>) -> JsResult<()> {
        let private_key = private_key.as_inner();
        // i
        js_sys::Reflect::set(obj, &JsValue::from("i"), &JsValue::from(private_key.i.to_string()))
            .map_err(|_| JsError::new("Failed to set i"))?;
        // x
        let x = private_key.x.clone().into_inner().as_ref().to_le_bytes();
        let js_x = JsValue::from(to_byte_array(&x));
        js_sys::Reflect::set(obj, &JsValue::from("x"), &js_x).map_err(|_| JsError::new("Failed to set x"))?;
        // shared_public_key
        let shared_public_key = private_key.key_info.shared_public_key.to_bytes(true).to_vec();
        let js_shared_public_key = JsValue::from(to_byte_array(&shared_public_key));
        js_sys::Reflect::set(obj, &JsValue::from("sharedPublicKey"), &js_shared_public_key)
            .map_err(|_| JsError::new("Failed to set sharedPublicKey"))?;
        // public_shares
        let js_public_shares = private_key
            .key_info
            .public_shares
            .iter()
            .map(|s| {
                let share = s.to_bytes(true).to_vec();
                JsValue::from(to_byte_array(&share))
            })
            .collect::<Array>();
        js_sys::Reflect::set(obj, &JsValue::from("publicShares"), &js_public_shares)
            .map_err(|_| JsError::new("Failed to set publicShares"))?;
        Ok(())
    }

    /// Convert a JS object into a EncryptedNadaValues
    #[wasm_bindgen]
    pub fn from_js_object(js_object: &JsValue, modulo: EncodedModulo) -> JsResult<EncryptedNadaValues> {
        use nillion_client_core::values::NadaValue as CoreNadaValue;
        if !js_object.is_object() {
            return Err(JsError::new(&format!(
                "EncryptedNadaValues cannot be created from the current value {:?}",
                js_object
            )));
        }
        let mut nada_values = HashMap::new();
        let object_keys =
            js_sys::Reflect::own_keys(js_object).map_err(|_| JsError::new("Failed reading object keys"))?;
        for key in object_keys.to_vec() {
            if let Some(name) = key.as_string() {
                let value = js_sys::Reflect::get(js_object, &key)
                    .map_err(|_| JsError::new(&format!("Value {name} not found")))?;
                let nada_type = js_sys::Reflect::get(&value, &JsValue::from("type"))
                    .map_err(|_| JsError::new("Failed value type not found"))?;
                if let Some(nada_type_name) = nada_type.as_string() {
                    let nada_value = match nada_type_name.as_str() {
                        "Integer" => {
                            let js_value = js_sys::Reflect::get(&value, &JsValue::from("value"))
                                .map_err(|_| JsError::new("Failed value not found"))?;
                            CoreNadaValue::new_integer(EncodedModularNumber::new_unchecked(
                                Uint8Array::from(js_value).to_vec(),
                                modulo.0,
                            ))
                        }
                        "UnsignedInteger" => {
                            let js_value = js_sys::Reflect::get(&value, &JsValue::from("value"))
                                .map_err(|_| JsError::new("Failed value not found"))?;
                            CoreNadaValue::new_unsigned_integer(EncodedModularNumber::new_unchecked(
                                Uint8Array::from(js_value).to_vec(),
                                modulo.0,
                            ))
                        }
                        "Boolean" => {
                            let js_value = js_sys::Reflect::get(&value, &JsValue::from("value"))
                                .map_err(|_| JsError::new("Failed value not found"))?;
                            CoreNadaValue::new_boolean(EncodedModularNumber::new_unchecked(
                                Uint8Array::from(js_value).to_vec(),
                                modulo.0,
                            ))
                        }
                        "ShamirShareInteger" => {
                            let js_value = js_sys::Reflect::get(&value, &JsValue::from("value"))
                                .map_err(|_| JsError::new("Failed value not found"))?;
                            CoreNadaValue::new_shamir_share_integer(EncodedModularNumber::new_unchecked(
                                Uint8Array::from(js_value).to_vec(),
                                modulo.0,
                            ))
                        }
                        "ShamirShareUnsignedInteger" => {
                            let js_value = js_sys::Reflect::get(&value, &JsValue::from("value"))
                                .map_err(|_| JsError::new("Failed value not found"))?;
                            CoreNadaValue::new_shamir_share_unsigned_integer(EncodedModularNumber::new_unchecked(
                                Uint8Array::from(js_value).to_vec(),
                                modulo.0,
                            ))
                        }
                        "ShamirShareBoolean" => {
                            let js_value = js_sys::Reflect::get(&value, &JsValue::from("value"))
                                .map_err(|_| JsError::new("Failed value not found"))?;
                            CoreNadaValue::new_shamir_share_boolean(EncodedModularNumber::new_unchecked(
                                Uint8Array::from(js_value).to_vec(),
                                modulo.0,
                            ))
                        }
                        "SecretBlob" => {
                            let js_shares = js_sys::Reflect::get(&value, &JsValue::from("shares"))
                                .map_err(|_| JsError::new("Failed shares not found"))?;
                            let shares = Array::from(&js_shares)
                                .to_vec()
                                .into_iter()
                                .map(|share| {
                                    EncodedModularNumber::new_unchecked(Uint8Array::from(share).to_vec(), modulo.0)
                                })
                                .collect::<Vec<_>>();
                            let js_unencoded_size = js_sys::Reflect::get(&value, &JsValue::from("originalSize"))
                                .map_err(|_| JsError::new("Failed originalSize not found"))?
                                .as_string()
                                .unwrap_or_default();
                            let unencoded_size = u64::from_str(&js_unencoded_size)
                                .map_err(|_| JsError::new("Invalid blob original size"))?;
                            CoreNadaValue::new_secret_blob(BlobPrimitiveType { value: shares, unencoded_size })
                        }
                        "EcdsaPrivateKey" => CoreNadaValue::new_ecdsa_private_key(Self::json_to_private_key(&value)?),
                        "EcdsaDigestMessage" => {
                            let js_digest = js_sys::Reflect::get(&value, &JsValue::from("digest"))
                                .map_err(|_| JsError::new("Failed digest not found"))?;
                            let digest: [u8; 32] = Uint8Array::from(js_digest)
                                .to_vec()
                                .try_into()
                                .map_err(|_| JsError::new("ecdsa message digest must be 32 bytes"))?;
                            CoreNadaValue::new_ecdsa_digest_message(digest)
                        }
                        "EcdsaSignature" => {
                            let js_r = js_sys::Reflect::get(&value, &JsValue::from("r"))
                                .map_err(|_| JsError::new("Failed r not found"))?;
                            let r = Uint8Array::from(js_r).to_vec();

                            let js_sigma = js_sys::Reflect::get(&value, &JsValue::from("sigma"))
                                .map_err(|_| JsError::new("Failed sigma not found"))?;
                            let sigma = Uint8Array::from(js_sigma).to_vec();

                            CoreNadaValue::new_ecdsa_signature(EcdsaSignatureShare {
                                r: Scalar::from_le_bytes(&r).map_err(|_| JsError::new("ecdsa scalar r is invalid"))?,
                                sigma: Scalar::from_le_bytes(&sigma)
                                    .map_err(|_| JsError::new("ecdsa scalar sigma is invalid"))?,
                            })
                        }
                        "EcdsaPublicKey" => {
                            let js_public_key = js_sys::Reflect::get(&value, &JsValue::from("publicKey"))
                                .map_err(|_| JsError::new("Failed publicKey not found"))?;
                            let public_key: [u8; 33] = Uint8Array::from(js_public_key)
                                .to_vec()
                                .try_into()
                                .map_err(|_| JsError::new("ecdsa public key must be 33 bytes"))?;
                            CoreNadaValue::new_ecdsa_public_key::<EcdsaPublicKeyArray>(public_key.into())
                        }
                        "EddsaPrivateKey" => CoreNadaValue::new_eddsa_private_key(Self::json_to_private_key(&value)?),
                        "EddsaMessage" => {
                            let js_message = js_sys::Reflect::get(&value, &JsValue::from("message"))
                                .map_err(|_| JsError::new("Failed eddsa messge not found"))?;
                            let message = Uint8Array::from(js_message).to_vec();
                            CoreNadaValue::new_eddsa_message(message)
                        }
                        "EddsaSignature" => {
                            let js_signature = js_sys::Reflect::get(&value, &JsValue::from("signature"))
                                .map_err(|_| JsError::new("Failed signature not found"))?;
                            let signature = Uint8Array::from(js_signature).to_vec();

                            let signature = signature::EddsaSignature::from_bytes(&signature)?;
                            CoreNadaValue::new_eddsa_signature(signature)
                        }
                        "EddsaPublicKey" => {
                            let js_public_key = js_sys::Reflect::get(&value, &JsValue::from("publicKey"))
                                .map_err(|_| JsError::new("Failed publicKey not found"))?;
                            let public_key: [u8; 32] = Uint8Array::from(js_public_key)
                                .to_vec()
                                .try_into()
                                .map_err(|_| JsError::new("eddsa public key must be 32 bytes"))?;
                            CoreNadaValue::new_eddsa_public_key(public_key)
                        }
                        "StoreId" => {
                            let js_store_id = js_sys::Reflect::get(&value, &JsValue::from("storeId"))
                                .map_err(|_| JsError::new("Failed storeId not found"))?;
                            let store_id: [u8; 16] = Uint8Array::from(js_store_id)
                                .to_vec()
                                .try_into()
                                .map_err(|_| JsError::new("store id must be 16 bytes"))?;
                            CoreNadaValue::new_store_id(store_id)
                        }
                        _ => Err(JsError::new(&format!("Unsupported type {:?}", nada_type_name)))?,
                    };
                    nada_values.insert(name, nada_value);
                } else {
                    return Err(JsError::new(&format!("Unexpected type {:?}, expected a string", nada_type)));
                }
            } else {
                return Err(JsError::new(&format!("Unexpected key {:?}, expected a string", js_object)));
            }
        }
        Ok(EncryptedNadaValues(nada_values))
    }

    fn json_to_private_key<T: Curve>(value: &JsValue) -> JsResult<ThresholdPrivateKeyShare<T>> {
        // i
        let js_i = js_sys::Reflect::get(value, &JsValue::from("i"))
            .map_err(|_| JsError::new("Failed i not found"))?
            .as_string()
            .unwrap_or_default();
        let i = u16::from_str(&js_i).map_err(|_| JsError::new("Invalid Ecdsa i"))?;
        // x
        let js_x = js_sys::Reflect::get(value, &JsValue::from("x")).map_err(|_| JsError::new("Failed x not found"))?;
        let x = non_zero_secret_scalar_from_js_value(js_x)?;
        // key_info
        let js_shared_public_key = js_sys::Reflect::get(value, &JsValue::from("sharedPublicKey"))
            .map_err(|_| JsError::new("Failed sharedPublicKey not found"))?;
        let js_public_shares = js_sys::Reflect::get(value, &JsValue::from("publicShares"))
            .map_err(|_| JsError::new("Failed publicShares not found"))?;
        let key_info = DirtyKeyInfo {
            curve: CurveName::new(),
            shared_public_key: non_zero_point_from_js_value(js_shared_public_key)?,
            public_shares: Array::from(&js_public_shares)
                .to_vec()
                .into_iter()
                .map(non_zero_point_from_js_value)
                .collect::<Result<_, _>>()?,
            vss_setup: None,
        };

        let share = DirtyCoreKeyShare { i, key_info, x }
            .validate()
            .map_err(|e| JsError::new(&format!("invalid ecdsa private key: {e:?}")))?;
        Ok(ThresholdPrivateKeyShare::new(share))
    }
}

fn non_zero_point_from_js_value<T: Curve>(js_value: JsValue) -> JsResult<NonZero<Point<T>>> {
    let bytes = Uint8Array::from(js_value).to_vec();
    let point =
        Point::from_bytes(&bytes).map_err(|_| JsError::new("Invalid ecdsa private key point: invalid bytes"))?;
    NonZero::from_point(point).ok_or(JsError::new("Invalid ecdsa private key point: point is zero"))
}

fn non_zero_secret_scalar_from_js_value<T: Curve>(js_value: JsValue) -> JsResult<NonZero<SecretScalar<T>>> {
    let bytes = Uint8Array::from(js_value).to_vec();
    let scalar = SecretScalar::from_le_bytes(&bytes)
        .map_err(|_| JsError::new("Invalid ecdsa private key secret scalar: invalid bytes"))?;
    NonZero::from_secret_scalar(scalar).ok_or(JsError::new("Invalid ecdsa private key secret scalar: scalar is zero"))
}

#[cfg(test)]
mod test {
    use super::*;
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::*;

    fn make_masker() -> SecretMasker {
        SecretMasker::new_64_bit_safe_prime(1, vec![PartyId(vec![1]), PartyId(vec![2]), PartyId(vec![3])])
            .map_err(JsValue::from)
            .expect("failed to build masker")
    }

    #[wasm_bindgen_test]
    fn secret_integer() {
        let secret = NadaValue::new_secret_integer("-42").map_err(JsValue::from).unwrap();
        assert_eq!(secret.to_integer().map_err(JsValue::from), Ok("-42".to_string()));
    }

    #[wasm_bindgen_test]
    fn secret_unsigned_integer() {
        let secret = NadaValue::new_secret_unsigned_integer("42").map_err(JsValue::from).unwrap();
        assert_eq!(secret.to_integer().map_err(JsValue::from), Ok("42".to_string()));
    }

    #[wasm_bindgen_test]
    fn secret_boolean() {
        let secret = NadaValue::new_secret_boolean(true).map_err(JsValue::from).unwrap();
        assert_eq!(secret.to_integer().map_err(JsValue::from), Ok("true".to_string()));
    }

    #[wasm_bindgen_test]
    fn secret_blob() {
        let contents = b"hi mom".to_vec();
        let secret = NadaValue::new_secret_blob(contents.clone());
        assert_eq!(secret.to_byte_array().map_err(JsValue::from), Ok(contents));
    }

    #[wasm_bindgen_test]
    fn new_secrets() {
        let secrets = NadaValues::new();
        assert_eq!(secrets.map_err(JsValue::from).unwrap().length(), 0);
    }

    #[wasm_bindgen_test]
    fn insert_secret() {
        let mut secrets = NadaValues::new().map_err(JsValue::from).unwrap();
        let secret = NadaValue::new_secret_integer("42").map_err(JsValue::from).unwrap();
        secrets.insert("my_secret".to_string(), &secret);
        assert_eq!(secrets.length(), 1);
    }

    #[wasm_bindgen_test]
    fn integer() {
        let variable = NadaValue::new_public_integer("-42").map_err(JsValue::from).unwrap();
        assert_eq!(variable.to_integer().map_err(JsValue::from), Ok("-42".to_string()));
    }

    #[wasm_bindgen_test]
    fn unsigned_integer() {
        let variable = NadaValue::new_public_unsigned_integer("42").map_err(JsValue::from).unwrap();
        assert_eq!(variable.to_integer().map_err(JsValue::from), Ok("42".to_string()));
    }

    #[wasm_bindgen_test]
    fn boolean() {
        let variable = NadaValue::new_public_boolean(false).map_err(JsValue::from).unwrap();
        assert_eq!(variable.to_integer().map_err(JsValue::from), Ok("false".to_string()));
    }

    #[wasm_bindgen_test]
    fn mask_unmask() -> Result<(), JsValue> {
        let mut values = NadaValues::new()?;
        values.insert("a".into(), &NadaValue::new_secret_integer("42")?);
        values.insert("b".into(), &NadaValue::new_secret_blob(vec![1, 2, 3]));
        values.insert("c".into(), &NadaValue::new_secret_unsigned_integer("1337")?);
        values.insert("d".into(), &NadaValue::new_secret_boolean(true)?);

        let masker = make_masker();
        let masked_values = masker.mask(values.clone())?;
        let unmasked_values = masker.unmask(masked_values)?;
        assert_eq!(unmasked_values, values);
        Ok(())
    }

    #[wasm_bindgen_test]
    fn value_classification() -> Result<(), JsValue> {
        let mut values = NadaValues::new()?;
        values.insert("a".into(), &NadaValue::new_secret_integer("42")?);
        values.insert("b".into(), &NadaValue::new_secret_blob(vec![1, 2, 3]));
        values.insert("c".into(), &NadaValue::new_secret_unsigned_integer("1337")?);
        values.insert("d".into(), &NadaValue::new_public_integer("101")?);

        let masker = make_masker();
        let NadaValuesClassification { shares, public, ecdsa_private_key_shares, ecdsa_signature_shares } =
            masker.classify_values(&values);
        assert_eq!(shares, 3);
        assert_eq!(public, 1);
        assert_eq!(ecdsa_private_key_shares, 0);
        assert_eq!(ecdsa_signature_shares, 0);
        Ok(())
    }

    #[wasm_bindgen_test]
    fn encrypted_nada_values_from_js_object() -> Result<(), JsValue> {
        let mut values = NadaValues::new()?;
        values.insert("integer".into(), &NadaValue::new_public_integer("42")?);
        values.insert("unsigned_integer".into(), &NadaValue::new_public_unsigned_integer("42")?);
        values.insert("boolean".into(), &NadaValue::new_public_boolean(true)?);
        values.insert("secret_integer".into(), &NadaValue::new_secret_integer("42")?);
        values.insert("secret_unsigned_integer".into(), &NadaValue::new_secret_unsigned_integer("42")?);
        values.insert("secret_boolean".into(), &NadaValue::new_secret_boolean(true)?);
        values.insert("secret_blob".into(), &NadaValue::new_secret_blob(vec![1, 2, 3]));
        values.insert("ecdsa_private_key".into(), &NadaValue::new_ecdsa_private_key(vec![1; 32])?);
        values.insert("ecdsa_message".into(), &NadaValue::new_ecdsa_digest_message(vec![1; 32])?);
        values.insert("ecdsa_public_key".into(), &NadaValue::new_ecdsa_public_key(vec![1; 33])?);
        values.insert("ecdsa_signature".into(), &NadaValue::new_ecdsa_signature(vec![1; 32], vec![1; 32])?);
        values.insert("eddsa_private_key".into(), &NadaValue::new_eddsa_private_key(vec![1; 32])?);
        values.insert("eddsa_message".into(), &NadaValue::new_eddsa_message(vec![1; 32])?);
        values.insert("eddsa_public_key".into(), &NadaValue::new_eddsa_public_key(vec![1; 32])?);
        values.insert(
            "eddsa_signature".into(),
            &NadaValue::new_eddsa_signature(
                vec![
                    228, 118, 63, 53, 138, 161, 20, 164, 93, 86, 233, 11, 211, 204, 186, 63, 255, 174, 220, 173, 222,
                    58, 64, 79, 108, 173, 130, 1, 134, 44, 244, 104,
                ],
                vec![
                    137, 73, 233, 168, 34, 64, 148, 185, 177, 91, 184, 21, 246, 82, 65, 207, 83, 158, 44, 181, 199, 94,
                    83, 178, 88, 238, 210, 220, 10, 49, 154, 1,
                ],
            )?,
        );
        values.insert("store_id".into(), &NadaValue::new_store_id(vec![1; 16])?);

        let masker = make_masker();
        let values = masker.mask(values.clone())?.into_iter().next().unwrap().shares;
        let js_object = values.to_js_object()?;
        let from_values = EncryptedNadaValues::from_js_object(&js_object, masker.modulo())?;

        assert_eq!(values, from_values);

        Ok(())
    }
}
