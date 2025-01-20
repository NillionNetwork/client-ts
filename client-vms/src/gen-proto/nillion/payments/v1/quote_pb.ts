// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file nillion/payments/v1/quote.proto (package nillion.payments.v1.quote, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Empty, Timestamp } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_empty, file_google_protobuf_timestamp } from "@bufbuild/protobuf/wkt";
import type { PreprocessingElement } from "../../preprocessing/v1/element_pb";
import { file_nillion_preprocessing_v1_element } from "../../preprocessing/v1/element_pb";
import type { AuxiliaryMaterial } from "../../preprocessing/v1/material_pb";
import { file_nillion_preprocessing_v1_material } from "../../preprocessing/v1/material_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file nillion/payments/v1/quote.proto.
 */
export const file_nillion_payments_v1_quote: GenFile = /*@__PURE__*/
  fileDesc("Ch9uaWxsaW9uL3BheW1lbnRzL3YxL3F1b3RlLnByb3RvEhluaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlIskEChFQcmljZVF1b3RlUmVxdWVzdBItCgtwb29sX3N0YXR1cxgBIAEoCzIWLmdvb2dsZS5wcm90b2J1Zi5FbXB0eUgAEkAKDXN0b3JlX3Byb2dyYW0YAiABKAsyJy5uaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlLlN0b3JlUHJvZ3JhbUgAEkQKD3JldHJpZXZlX3ZhbHVlcxgDIAEoCzIpLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuUmV0cmlldmVWYWx1ZXNIABJOChRyZXRyaWV2ZV9wZXJtaXNzaW9ucxgEIAEoCzIuLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuUmV0cmlldmVQZXJtaXNzaW9uc0gAEj4KDHN0b3JlX3ZhbHVlcxgFIAEoCzImLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuU3RvcmVWYWx1ZXNIABJCCg5pbnZva2VfY29tcHV0ZRgGIAEoCzIoLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuSW52b2tlQ29tcHV0ZUgAElAKFW92ZXJ3cml0ZV9wZXJtaXNzaW9ucxgHIAEoCzIvLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuT3ZlcndyaXRlUGVybWlzc2lvbnNIABJKChJ1cGRhdGVfcGVybWlzc2lvbnMYCCABKAsyLC5uaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlLlVwZGF0ZVBlcm1pc3Npb25zSABCCwoJb3BlcmF0aW9uIi8KC1NpZ25lZFF1b3RlEg0KBXF1b3RlGAEgASgMEhEKCXNpZ25hdHVyZRgCIAEoDCL5AgoKUHJpY2VRdW90ZRINCgVub25jZRgBIAEoDBIyCgRmZWVzGAIgASgLMiQubmlsbGlvbi5wYXltZW50cy52MS5xdW90ZS5RdW90ZUZlZXMSPQoHcmVxdWVzdBgDIAEoCzIsLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuUHJpY2VRdW90ZVJlcXVlc3QSLgoKZXhwaXJlc19hdBgEIAEoCzIaLmdvb2dsZS5wcm90b2J1Zi5UaW1lc3RhbXASVwoacHJlcHJvY2Vzc2luZ19yZXF1aXJlbWVudHMYBSADKAsyMy5uaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlLlByZXByb2Nlc3NpbmdSZXF1aXJlbWVudBJgCh9hdXhpbGlhcnlfbWF0ZXJpYWxfcmVxdWlyZW1lbnRzGAYgAygLMjcubmlsbGlvbi5wYXltZW50cy52MS5xdW90ZS5BdXhpbGlhcnlNYXRlcmlhbFJlcXVpcmVtZW50IiAKCVF1b3RlRmVlcxINCgV0b3RhbBgBIAEoBEoECAIQByJzCgxTdG9yZVByb2dyYW0SPAoIbWV0YWRhdGEYASABKAsyKi5uaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlLlByb2dyYW1NZXRhZGF0YRIXCg9jb250ZW50c19zaGEyNTYYAiABKAwSDAoEbmFtZRgDIAEoCSKbAwoPUHJvZ3JhbU1ldGFkYXRhEhQKDHByb2dyYW1fc2l6ZRgBIAEoBBITCgttZW1vcnlfc2l6ZRgCIAEoBBIZChFpbnN0cnVjdGlvbl9jb3VudBgDIAEoBBJSCgxpbnN0cnVjdGlvbnMYBCADKAsyPC5uaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlLlByb2dyYW1NZXRhZGF0YS5JbnN0cnVjdGlvbnNFbnRyeRJXChpwcmVwcm9jZXNzaW5nX3JlcXVpcmVtZW50cxgFIAMoCzIzLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGUuUHJlcHJvY2Vzc2luZ1JlcXVpcmVtZW50EmAKH2F1eGlsaWFyeV9tYXRlcmlhbF9yZXF1aXJlbWVudHMYBiADKAsyNy5uaWxsaW9uLnBheW1lbnRzLnYxLnF1b3RlLkF1eGlsaWFyeU1hdGVyaWFsUmVxdWlyZW1lbnQaMwoRSW5zdHJ1Y3Rpb25zRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgEOgI4ASJyChhQcmVwcm9jZXNzaW5nUmVxdWlyZW1lbnQSRwoHZWxlbWVudBgBIAEoDjI2Lm5pbGxpb24ucHJlcHJvY2Vzc2luZy52MS5lbGVtZW50LlByZXByb2Nlc3NpbmdFbGVtZW50Eg0KBWNvdW50GAIgASgEIncKHEF1eGlsaWFyeU1hdGVyaWFsUmVxdWlyZW1lbnQSRgoIbWF0ZXJpYWwYASABKA4yNC5uaWxsaW9uLnByZXByb2Nlc3NpbmcudjEubWF0ZXJpYWwuQXV4aWxpYXJ5TWF0ZXJpYWwSDwoHdmVyc2lvbhgCIAEoDSIjCg5SZXRyaWV2ZVZhbHVlcxIRCgl2YWx1ZXNfaWQYASABKAwiKAoTUmV0cmlldmVQZXJtaXNzaW9ucxIRCgl2YWx1ZXNfaWQYASABKAwiKQoUT3ZlcndyaXRlUGVybWlzc2lvbnMSEQoJdmFsdWVzX2lkGAEgASgMIiYKEVVwZGF0ZVBlcm1pc3Npb25zEhEKCXZhbHVlc19pZBgBIAEoDCLVAQoLU3RvcmVWYWx1ZXMSGwoTc2VjcmV0X3NoYXJlZF9jb3VudBgCIAEoBBIbChNwdWJsaWNfdmFsdWVzX2NvdW50GAMgASgEEhUKCHR0bF9kYXlzGAQgASgNSACIAQESFAoMcGF5bG9hZF9zaXplGAUgASgEEiYKHmVjZHNhX3ByaXZhdGVfa2V5X3NoYXJlc19jb3VudBgGIAEoBBIkChxlY2RzYV9zaWduYXR1cmVfc2hhcmVzX2NvdW50GAcgASgEQgsKCV90dGxfZGF5c0oECAEQAiJACg1JbnZva2VDb21wdXRlEhIKCnByb2dyYW1faWQYASABKAkSGwoTdmFsdWVzX3BheWxvYWRfc2l6ZRgCIAEoBEKzAQodY29tLm5pbGxpb24ucGF5bWVudHMudjEucXVvdGVCClF1b3RlUHJvdG9QAaICBE5QVlGqAhlOaWxsaW9uLlBheW1lbnRzLlYxLlF1b3RlygIZTmlsbGlvblxQYXltZW50c1xWMVxRdW90ZeICJU5pbGxpb25cUGF5bWVudHNcVjFcUXVvdGVcR1BCTWV0YWRhdGHqAhxOaWxsaW9uOjpQYXltZW50czo6VjE6OlF1b3RlYgZwcm90bzM", [file_google_protobuf_empty, file_google_protobuf_timestamp, file_nillion_preprocessing_v1_element, file_nillion_preprocessing_v1_material]);

/**
 * A price quote request.
 *
 * @generated from message nillion.payments.v1.quote.PriceQuoteRequest
 */
export type PriceQuoteRequest = Message<"nillion.payments.v1.quote.PriceQuoteRequest"> & {
  /**
   * @generated from oneof nillion.payments.v1.quote.PriceQuoteRequest.operation
   */
  operation: {
    /**
     * A pool status operation.
     *
     * @generated from field: google.protobuf.Empty pool_status = 1;
     */
    value: Empty;
    case: "poolStatus";
  } | {
    /**
     * A store program operation.
     *
     * @generated from field: nillion.payments.v1.quote.StoreProgram store_program = 2;
     */
    value: StoreProgram;
    case: "storeProgram";
  } | {
    /**
     * A retrieve values operation.
     *
     * @generated from field: nillion.payments.v1.quote.RetrieveValues retrieve_values = 3;
     */
    value: RetrieveValues;
    case: "retrieveValues";
  } | {
    /**
     * A retrieve permissions operation.
     *
     * @generated from field: nillion.payments.v1.quote.RetrievePermissions retrieve_permissions = 4;
     */
    value: RetrievePermissions;
    case: "retrievePermissions";
  } | {
    /**
     * A store values operation.
     *
     * @generated from field: nillion.payments.v1.quote.StoreValues store_values = 5;
     */
    value: StoreValues;
    case: "storeValues";
  } | {
    /**
     * A invoke compute operation.
     *
     * @generated from field: nillion.payments.v1.quote.InvokeCompute invoke_compute = 6;
     */
    value: InvokeCompute;
    case: "invokeCompute";
  } | {
    /**
     * An overwrite permissions operation.
     *
     * @generated from field: nillion.payments.v1.quote.OverwritePermissions overwrite_permissions = 7;
     */
    value: OverwritePermissions;
    case: "overwritePermissions";
  } | {
    /**
     * An update permissions operation.
     *
     * @generated from field: nillion.payments.v1.quote.UpdatePermissions update_permissions = 8;
     */
    value: UpdatePermissions;
    case: "updatePermissions";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message nillion.payments.v1.quote.PriceQuoteRequest.
 * Use `create(PriceQuoteRequestSchema)` to create a new message.
 */
export const PriceQuoteRequestSchema: GenMessage<PriceQuoteRequest> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 0);

/**
 * A quote signed by the node that generated it.
 *
 * @generated from message nillion.payments.v1.quote.SignedQuote
 */
export type SignedQuote = Message<"nillion.payments.v1.quote.SignedQuote"> & {
  /**
   * The serialized `PriceQuote`.
   *
   * @generated from field: bytes quote = 1;
   */
  quote: Uint8Array;

  /**
   * The signature for this quote.
   *
   * @generated from field: bytes signature = 2;
   */
  signature: Uint8Array;
};

/**
 * Describes the message nillion.payments.v1.quote.SignedQuote.
 * Use `create(SignedQuoteSchema)` to create a new message.
 */
export const SignedQuoteSchema: GenMessage<SignedQuote> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 1);

/**
 * A price quote.
 *
 * @generated from message nillion.payments.v1.quote.PriceQuote
 */
export type PriceQuote = Message<"nillion.payments.v1.quote.PriceQuote"> & {
  /**
   * A nonce that uniquely identifies this quote.
   *
   * @generated from field: bytes nonce = 1;
   */
  nonce: Uint8Array;

  /**
   * The fees for this quote.
   *
   * @generated from field: nillion.payments.v1.quote.QuoteFees fees = 2;
   */
  fees?: QuoteFees;

  /**
   * The request that this quote is for.
   *
   * @generated from field: nillion.payments.v1.quote.PriceQuoteRequest request = 3;
   */
  request?: PriceQuoteRequest;

  /**
   * The point in time at which this quote is no longer valid.
   *
   * @generated from field: google.protobuf.Timestamp expires_at = 4;
   */
  expiresAt?: Timestamp;

  /**
   * The preprocessing requirements for this operation.
   *
   * @generated from field: repeated nillion.payments.v1.quote.PreprocessingRequirement preprocessing_requirements = 5;
   */
  preprocessingRequirements: PreprocessingRequirement[];

  /**
   * The auxiliary material requirements for this operation.
   *
   * @generated from field: repeated nillion.payments.v1.quote.AuxiliaryMaterialRequirement auxiliary_material_requirements = 6;
   */
  auxiliaryMaterialRequirements: AuxiliaryMaterialRequirement[];
};

/**
 * Describes the message nillion.payments.v1.quote.PriceQuote.
 * Use `create(PriceQuoteSchema)` to create a new message.
 */
export const PriceQuoteSchema: GenMessage<PriceQuote> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 2);

/**
 * The fees associated with a quote.
 *
 * All fees are in "unil" units.
 *
 * @generated from message nillion.payments.v1.quote.QuoteFees
 */
export type QuoteFees = Message<"nillion.payments.v1.quote.QuoteFees"> & {
  /**
   * The total fee for this quote.
   *
   * @generated from field: uint64 total = 1;
   */
  total: bigint;
};

/**
 * Describes the message nillion.payments.v1.quote.QuoteFees.
 * Use `create(QuoteFeesSchema)` to create a new message.
 */
export const QuoteFeesSchema: GenMessage<QuoteFees> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 3);

/**
 * A store program operation.
 *
 * @generated from message nillion.payments.v1.quote.StoreProgram
 */
export type StoreProgram = Message<"nillion.payments.v1.quote.StoreProgram"> & {
  /**
   * The program's metadata.
   *
   * @generated from field: nillion.payments.v1.quote.ProgramMetadata metadata = 1;
   */
  metadata?: ProgramMetadata;

  /**
   * A sha256 hash of the compiled program.
   *
   * @generated from field: bytes contents_sha256 = 2;
   */
  contentsSha256: Uint8Array;

  /**
   * The program's name.
   *
   * @generated from field: string name = 3;
   */
  name: string;
};

/**
 * Describes the message nillion.payments.v1.quote.StoreProgram.
 * Use `create(StoreProgramSchema)` to create a new message.
 */
export const StoreProgramSchema: GenMessage<StoreProgram> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 4);

/**
 * The metadata about a program being stored.
 *
 * @generated from message nillion.payments.v1.quote.ProgramMetadata
 */
export type ProgramMetadata = Message<"nillion.payments.v1.quote.ProgramMetadata"> & {
  /**
   * The size of the program in bytes.
   *
   * @generated from field: uint64 program_size = 1;
   */
  programSize: bigint;

  /**
   * The amount of memory needed by the program.
   *
   * @generated from field: uint64 memory_size = 2;
   */
  memorySize: bigint;

  /**
   * The total number of instructions in the program.
   *
   * @generated from field: uint64 instruction_count = 3;
   */
  instructionCount: bigint;

  /**
   * The number of instructions per type.
   *
   * @generated from field: map<string, uint64> instructions = 4;
   */
  instructions: { [key: string]: bigint };

  /**
   * The preprocessing requirements.
   *
   * @generated from field: repeated nillion.payments.v1.quote.PreprocessingRequirement preprocessing_requirements = 5;
   */
  preprocessingRequirements: PreprocessingRequirement[];

  /**
   * The auxiliary material requirements.
   *
   * @generated from field: repeated nillion.payments.v1.quote.AuxiliaryMaterialRequirement auxiliary_material_requirements = 6;
   */
  auxiliaryMaterialRequirements: AuxiliaryMaterialRequirement[];
};

/**
 * Describes the message nillion.payments.v1.quote.ProgramMetadata.
 * Use `create(ProgramMetadataSchema)` to create a new message.
 */
export const ProgramMetadataSchema: GenMessage<ProgramMetadata> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 5);

/**
 * The number of preprocessing elements required for a program.
 *
 * @generated from message nillion.payments.v1.quote.PreprocessingRequirement
 */
export type PreprocessingRequirement = Message<"nillion.payments.v1.quote.PreprocessingRequirement"> & {
  /**
   * The preprocessing element.
   *
   * @generated from field: nillion.preprocessing.v1.element.PreprocessingElement element = 1;
   */
  element: PreprocessingElement;

  /**
   * The total number of elements of this type needed.
   *
   * @generated from field: uint64 count = 2;
   */
  count: bigint;
};

/**
 * Describes the message nillion.payments.v1.quote.PreprocessingRequirement.
 * Use `create(PreprocessingRequirementSchema)` to create a new message.
 */
export const PreprocessingRequirementSchema: GenMessage<PreprocessingRequirement> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 6);

/**
 * The auxiliary material required for a program.
 *
 * @generated from message nillion.payments.v1.quote.AuxiliaryMaterialRequirement
 */
export type AuxiliaryMaterialRequirement = Message<"nillion.payments.v1.quote.AuxiliaryMaterialRequirement"> & {
  /**
   * The preprocessing element.
   *
   * @generated from field: nillion.preprocessing.v1.material.AuxiliaryMaterial material = 1;
   */
  material: AuxiliaryMaterial;

  /**
   * The version needed.
   *
   * This field is used internally and should be ignored by the client.
   *
   * @generated from field: uint32 version = 2;
   */
  version: number;
};

/**
 * Describes the message nillion.payments.v1.quote.AuxiliaryMaterialRequirement.
 * Use `create(AuxiliaryMaterialRequirementSchema)` to create a new message.
 */
export const AuxiliaryMaterialRequirementSchema: GenMessage<AuxiliaryMaterialRequirement> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 7);

/**
 * A retrieve values operation.
 *
 * @generated from message nillion.payments.v1.quote.RetrieveValues
 */
export type RetrieveValues = Message<"nillion.payments.v1.quote.RetrieveValues"> & {
  /**
   * The identifier to be retrieved.
   *
   * @generated from field: bytes values_id = 1;
   */
  valuesId: Uint8Array;
};

/**
 * Describes the message nillion.payments.v1.quote.RetrieveValues.
 * Use `create(RetrieveValuesSchema)` to create a new message.
 */
export const RetrieveValuesSchema: GenMessage<RetrieveValues> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 8);

/**
 * A retrieve permissions operation.
 *
 * @generated from message nillion.payments.v1.quote.RetrievePermissions
 */
export type RetrievePermissions = Message<"nillion.payments.v1.quote.RetrievePermissions"> & {
  /**
   * The identifier of the values entity to be retrieved.
   *
   * @generated from field: bytes values_id = 1;
   */
  valuesId: Uint8Array;
};

/**
 * Describes the message nillion.payments.v1.quote.RetrievePermissions.
 * Use `create(RetrievePermissionsSchema)` to create a new message.
 */
export const RetrievePermissionsSchema: GenMessage<RetrievePermissions> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 9);

/**
 * An overwrite permissions operation.
 *
 * @generated from message nillion.payments.v1.quote.OverwritePermissions
 */
export type OverwritePermissions = Message<"nillion.payments.v1.quote.OverwritePermissions"> & {
  /**
   * The identifier of the values entity whose permissions are to be overwritten.
   *
   * @generated from field: bytes values_id = 1;
   */
  valuesId: Uint8Array;
};

/**
 * Describes the message nillion.payments.v1.quote.OverwritePermissions.
 * Use `create(OverwritePermissionsSchema)` to create a new message.
 */
export const OverwritePermissionsSchema: GenMessage<OverwritePermissions> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 10);

/**
 * An update permissions operation.
 *
 * @generated from message nillion.payments.v1.quote.UpdatePermissions
 */
export type UpdatePermissions = Message<"nillion.payments.v1.quote.UpdatePermissions"> & {
  /**
   * The identifier of the values entity whose permissions are to be updated.
   *
   * @generated from field: bytes values_id = 1;
   */
  valuesId: Uint8Array;
};

/**
 * Describes the message nillion.payments.v1.quote.UpdatePermissions.
 * Use `create(UpdatePermissionsSchema)` to create a new message.
 */
export const UpdatePermissionsSchema: GenMessage<UpdatePermissions> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 11);

/**
 * A store values operation.
 *
 * @generated from message nillion.payments.v1.quote.StoreValues
 */
export type StoreValues = Message<"nillion.payments.v1.quote.StoreValues"> & {
  /**
   * The number of secret shared secrets being stored.
   *
   * This is the number of secrets in secret shared form being stored, not the total number of shares. e.g.
   * for a 5 node network a single secret shared secret requires value `1` here rather than `5`.
   *
   * @generated from field: uint64 secret_shared_count = 2;
   */
  secretSharedCount: bigint;

  /**
   * The number of public values being stored.
   *
   * @generated from field: uint64 public_values_count = 3;
   */
  publicValuesCount: bigint;

  /**
   * The number of days to persist these secrets for.
   *
   * @generated from field: optional uint32 ttl_days = 4;
   */
  ttlDays?: number;

  /**
   * The size of the payload to be stored.
   *
   * @generated from field: uint64 payload_size = 5;
   */
  payloadSize: bigint;

  /**
   * The size of the payload to be stored.
   *
   * @generated from field: uint64 ecdsa_private_key_shares_count = 6;
   */
  ecdsaPrivateKeySharesCount: bigint;

  /**
   * The size of the payload to be stored.
   *
   * @generated from field: uint64 ecdsa_signature_shares_count = 7;
   */
  ecdsaSignatureSharesCount: bigint;
};

/**
 * Describes the message nillion.payments.v1.quote.StoreValues.
 * Use `create(StoreValuesSchema)` to create a new message.
 */
export const StoreValuesSchema: GenMessage<StoreValues> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 12);

/**
 * An invoke compute operation.
 *
 * @generated from message nillion.payments.v1.quote.InvokeCompute
 */
export type InvokeCompute = Message<"nillion.payments.v1.quote.InvokeCompute"> & {
  /**
   * The program to be invoked.
   *
   * @generated from field: string program_id = 1;
   */
  programId: string;

  /**
   * The size of the compute time values being sent as part of this operation.
   *
   * @generated from field: uint64 values_payload_size = 2;
   */
  valuesPayloadSize: bigint;
};

/**
 * Describes the message nillion.payments.v1.quote.InvokeCompute.
 * Use `create(InvokeComputeSchema)` to create a new message.
 */
export const InvokeComputeSchema: GenMessage<InvokeCompute> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_quote, 13);

