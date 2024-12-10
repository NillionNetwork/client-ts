// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file nillion/payments/v1/balance.proto (package nillion.payments.v1.balance, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Timestamp } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_timestamp } from "@bufbuild/protobuf/wkt";
import type { UserId } from "../../auth/v1/user_pb";
import { file_nillion_auth_v1_user } from "../../auth/v1/user_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file nillion/payments/v1/balance.proto.
 */
export const file_nillion_payments_v1_balance: GenFile = /*@__PURE__*/
  fileDesc("CiFuaWxsaW9uL3BheW1lbnRzL3YxL2JhbGFuY2UucHJvdG8SG25pbGxpb24ucGF5bWVudHMudjEuYmFsYW5jZSJbChZBY2NvdW50QmFsYW5jZVJlc3BvbnNlEg8KB2JhbGFuY2UYASABKAQSMAoMbGFzdF91cGRhdGVkGAIgASgLMhouZ29vZ2xlLnByb3RvYnVmLlRpbWVzdGFtcCIzCg9BZGRGdW5kc1JlcXVlc3QSDwoHcGF5bG9hZBgBIAEoDBIPCgd0eF9oYXNoGAIgASgJIlEKD0FkZEZ1bmRzUGF5bG9hZBIvCglyZWNpcGllbnQYASABKAsyHC5uaWxsaW9uLmF1dGgudjEudXNlci5Vc2VySWQSDQoFbm9uY2UYAiABKAxCvwEKH2NvbS5uaWxsaW9uLnBheW1lbnRzLnYxLmJhbGFuY2VCDEJhbGFuY2VQcm90b1ABogIETlBWQqoCG05pbGxpb24uUGF5bWVudHMuVjEuQmFsYW5jZcoCG05pbGxpb25cUGF5bWVudHNcVjFcQmFsYW5jZeICJ05pbGxpb25cUGF5bWVudHNcVjFcQmFsYW5jZVxHUEJNZXRhZGF0YeoCHk5pbGxpb246OlBheW1lbnRzOjpWMTo6QmFsYW5jZWIGcHJvdG8z", [file_google_protobuf_timestamp, file_nillion_auth_v1_user]);

/**
 * A response to a request to get the user account's balance.
 *
 * @generated from message nillion.payments.v1.balance.AccountBalanceResponse
 */
export type AccountBalanceResponse = Message<"nillion.payments.v1.balance.AccountBalanceResponse"> & {
  /**
   * The account balance, in unil.
   *
   * @generated from field: uint64 balance = 1;
   */
  balance: bigint;

  /**
   * The timestamp at which this balance was last updated.
   *
   * @generated from field: google.protobuf.Timestamp last_updated = 2;
   */
  lastUpdated?: Timestamp;
};

/**
 * Describes the message nillion.payments.v1.balance.AccountBalanceResponse.
 * Use `create(AccountBalanceResponseSchema)` to create a new message.
 */
export const AccountBalanceResponseSchema: GenMessage<AccountBalanceResponse> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_balance, 0);

/**
 * A request to add funds to a user's account.
 *
 * @generated from message nillion.payments.v1.balance.AddFundsRequest
 */
export type AddFundsRequest = Message<"nillion.payments.v1.balance.AddFundsRequest"> & {
  /**
   * The serialized `AddFunds` payload.
   *
   * @generated from field: bytes payload = 1;
   */
  payload: Uint8Array;

  /**
   * The nilchain transaction hash that proves this payment was made.
   *
   * @generated from field: string tx_hash = 2;
   */
  txHash: string;
};

/**
 * Describes the message nillion.payments.v1.balance.AddFundsRequest.
 * Use `create(AddFundsRequestSchema)` to create a new message.
 */
export const AddFundsRequestSchema: GenMessage<AddFundsRequest> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_balance, 1);

/**
 * The payload sent as part of an add funds request.
 *
 * @generated from message nillion.payments.v1.balance.AddFundsPayload
 */
export type AddFundsPayload = Message<"nillion.payments.v1.balance.AddFundsPayload"> & {
  /**
   * The user the funds are being given to.
   *
   * @generated from field: nillion.auth.v1.user.UserId recipient = 1;
   */
  recipient?: UserId;

  /**
   * A 32 byte nonce that is used to add entropy to the hash of this message and to prevent duplicate spending.
   *
   * @generated from field: bytes nonce = 2;
   */
  nonce: Uint8Array;
};

/**
 * Describes the message nillion.payments.v1.balance.AddFundsPayload.
 * Use `create(AddFundsPayloadSchema)` to create a new message.
 */
export const AddFundsPayloadSchema: GenMessage<AddFundsPayload> = /*@__PURE__*/
  messageDesc(file_nillion_payments_v1_balance, 2);
