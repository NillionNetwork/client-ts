// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file nillion/compute/v1/invoke.proto (package nillion.compute.v1.invoke, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { SignedReceipt } from "../../payments/v1/receipt_pb";
import { file_nillion_payments_v1_receipt } from "../../payments/v1/receipt_pb";
import type { UserId } from "../../auth/v1/user_pb";
import { file_nillion_auth_v1_user } from "../../auth/v1/user_pb";
import type { NamedValue } from "../../values/v1/value_pb";
import { file_nillion_values_v1_value } from "../../values/v1/value_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file nillion/compute/v1/invoke.proto.
 */
export const file_nillion_compute_v1_invoke: GenFile = /*@__PURE__*/
  fileDesc("Ch9uaWxsaW9uL2NvbXB1dGUvdjEvaW52b2tlLnByb3RvEhluaWxsaW9uLmNvbXB1dGUudjEuaW52b2tlIrYCChRJbnZva2VDb21wdXRlUmVxdWVzdBJCCg5zaWduZWRfcmVjZWlwdBgBIAEoCzIqLm5pbGxpb24ucGF5bWVudHMudjEucmVjZWlwdC5TaWduZWRSZWNlaXB0EhEKCXZhbHVlX2lkcxgCIAMoDBJECg5pbnB1dF9iaW5kaW5ncxgEIAMoCzIsLm5pbGxpb24uY29tcHV0ZS52MS5pbnZva2UuSW5wdXRQYXJ0eUJpbmRpbmcSRgoPb3V0cHV0X2JpbmRpbmdzGAUgAygLMi0ubmlsbGlvbi5jb21wdXRlLnYxLmludm9rZS5PdXRwdXRQYXJ0eUJpbmRpbmcSMwoGdmFsdWVzGAYgAygLMiMubmlsbGlvbi52YWx1ZXMudjEudmFsdWUuTmFtZWRWYWx1ZUoECAMQBCIrChVJbnZva2VDb21wdXRlUmVzcG9uc2USEgoKY29tcHV0ZV9pZBgBIAEoDCJTChFJbnB1dFBhcnR5QmluZGluZxISCgpwYXJ0eV9uYW1lGAEgASgJEioKBHVzZXIYAiABKAsyHC5uaWxsaW9uLmF1dGgudjEudXNlci5Vc2VySWQiVQoST3V0cHV0UGFydHlCaW5kaW5nEhIKCnBhcnR5X25hbWUYASABKAkSKwoFdXNlcnMYAiADKAsyHC5uaWxsaW9uLmF1dGgudjEudXNlci5Vc2VySWRCtAEKHWNvbS5uaWxsaW9uLmNvbXB1dGUudjEuaW52b2tlQgtJbnZva2VQcm90b1ABogIETkNWSaoCGU5pbGxpb24uQ29tcHV0ZS5WMS5JbnZva2XKAhlOaWxsaW9uXENvbXB1dGVcVjFcSW52b2tl4gIlTmlsbGlvblxDb21wdXRlXFYxXEludm9rZVxHUEJNZXRhZGF0YeoCHE5pbGxpb246OkNvbXB1dGU6OlYxOjpJbnZva2ViBnByb3RvMw", [file_nillion_payments_v1_receipt, file_nillion_auth_v1_user, file_nillion_values_v1_value]);

/**
 * A request to invoke a computation.
 *
 * @generated from message nillion.compute.v1.invoke.InvokeComputeRequest
 */
export type InvokeComputeRequest = Message<"nillion.compute.v1.invoke.InvokeComputeRequest"> & {
  /**
   * The receipt that proves this operation was paid for.
   *
   * The receipt must be for a `InvokeCompute` operation.
   *
   * @generated from field: nillion.payments.v1.receipt.SignedReceipt signed_receipt = 1;
   */
  signedReceipt?: SignedReceipt;

  /**
   * The value ids for previously stored values being used as parameters to this compute operation.
   *
   * @generated from field: repeated bytes value_ids = 2;
   */
  valueIds: Uint8Array[];

  /**
   * The bindings that define which input party in the program is which user in the network.
   *
   * @generated from field: repeated nillion.compute.v1.invoke.InputPartyBinding input_bindings = 4;
   */
  inputBindings: InputPartyBinding[];

  /**
   * The bindings that define which output party in the program is which users in the network.
   *
   * @generated from field: repeated nillion.compute.v1.invoke.OutputPartyBinding output_bindings = 5;
   */
  outputBindings: OutputPartyBinding[];

  /**
   * The values being used as compute-time parameters
   *
   * @generated from field: repeated nillion.values.v1.value.NamedValue values = 6;
   */
  values: NamedValue[];
};

/**
 * Describes the message nillion.compute.v1.invoke.InvokeComputeRequest.
 * Use `create(InvokeComputeRequestSchema)` to create a new message.
 */
export const InvokeComputeRequestSchema: GenMessage<InvokeComputeRequest> = /*@__PURE__*/
  messageDesc(file_nillion_compute_v1_invoke, 0);

/**
 * A response to a request to invoke a computation.
 *
 * @generated from message nillion.compute.v1.invoke.InvokeComputeResponse
 */
export type InvokeComputeResponse = Message<"nillion.compute.v1.invoke.InvokeComputeResponse"> & {
  /**
   * An identifier for the execution of the computation.
   *
   * @generated from field: bytes compute_id = 1;
   */
  computeId: Uint8Array;
};

/**
 * Describes the message nillion.compute.v1.invoke.InvokeComputeResponse.
 * Use `create(InvokeComputeResponseSchema)` to create a new message.
 */
export const InvokeComputeResponseSchema: GenMessage<InvokeComputeResponse> = /*@__PURE__*/
  messageDesc(file_nillion_compute_v1_invoke, 1);

/**
 * The bindings for input parties in a program.
 *
 * @generated from message nillion.compute.v1.invoke.InputPartyBinding
 */
export type InputPartyBinding = Message<"nillion.compute.v1.invoke.InputPartyBinding"> & {
  /**
   * The name of the party as defined in the program.
   *
   * @generated from field: string party_name = 1;
   */
  partyName: string;

  /**
   * The user identity this party is being bound to.
   *
   * @generated from field: nillion.auth.v1.user.UserId user = 2;
   */
  user?: UserId;
};

/**
 * Describes the message nillion.compute.v1.invoke.InputPartyBinding.
 * Use `create(InputPartyBindingSchema)` to create a new message.
 */
export const InputPartyBindingSchema: GenMessage<InputPartyBinding> = /*@__PURE__*/
  messageDesc(file_nillion_compute_v1_invoke, 2);

/**
 * The bindings for output parties in a program.
 *
 * @generated from message nillion.compute.v1.invoke.OutputPartyBinding
 */
export type OutputPartyBinding = Message<"nillion.compute.v1.invoke.OutputPartyBinding"> & {
  /**
   * The name of the party as defined in the program.
   *
   * @generated from field: string party_name = 1;
   */
  partyName: string;

  /**
   * The user identities this party is being bound to.
   *
   * @generated from field: repeated nillion.auth.v1.user.UserId users = 2;
   */
  users: UserId[];
};

/**
 * Describes the message nillion.compute.v1.invoke.OutputPartyBinding.
 * Use `create(OutputPartyBindingSchema)` to create a new message.
 */
export const OutputPartyBindingSchema: GenMessage<OutputPartyBinding> = /*@__PURE__*/
  messageDesc(file_nillion_compute_v1_invoke, 3);

