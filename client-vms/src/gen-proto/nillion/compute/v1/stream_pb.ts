// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file nillion/compute/v1/stream.proto (package nillion.compute.v1.stream, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file nillion/compute/v1/stream.proto.
 */
export const file_nillion_compute_v1_stream: GenFile = /*@__PURE__*/
  fileDesc("Ch9uaWxsaW9uL2NvbXB1dGUvdjEvc3RyZWFtLnByb3RvEhluaWxsaW9uLmNvbXB1dGUudjEuc3RyZWFtIoEBChRDb21wdXRlU3RyZWFtTWVzc2FnZRISCgpjb21wdXRlX2lkGAEgASgMEhcKD2JpbmNvZGVfbWVzc2FnZRgCIAEoDBI8Cgxjb21wdXRlX3R5cGUYAyABKA4yJi5uaWxsaW9uLmNvbXB1dGUudjEuc3RyZWFtLkNvbXB1dGVUeXBlKjgKC0NvbXB1dGVUeXBlEgsKB0dFTkVSQUwQABINCglFQ0RTQV9ES0cQARINCglFRERTQV9ES0cQAkK0AQodY29tLm5pbGxpb24uY29tcHV0ZS52MS5zdHJlYW1CC1N0cmVhbVByb3RvUAGiAgROQ1ZTqgIZTmlsbGlvbi5Db21wdXRlLlYxLlN0cmVhbcoCGU5pbGxpb25cQ29tcHV0ZVxWMVxTdHJlYW3iAiVOaWxsaW9uXENvbXB1dGVcVjFcU3RyZWFtXEdQQk1ldGFkYXRh6gIcTmlsbGlvbjo6Q29tcHV0ZTo6VjE6OlN0cmVhbWIGcHJvdG8z");

/**
 * A message for a compute stream.
 *
 * @generated from message nillion.compute.v1.stream.ComputeStreamMessage
 */
export type ComputeStreamMessage = Message<"nillion.compute.v1.stream.ComputeStreamMessage"> & {
  /**
   * An identifier for the computation instance.
   *
   * Only the first ever message on the stream requires having this attribute set. Any subsequent message will
   * have this field ignored.
   *
   * @generated from field: bytes compute_id = 1;
   */
  computeId: Uint8Array;

  /**
   * The VM message in bincode format.
   *
   * @generated from field: bytes bincode_message = 2;
   */
  bincodeMessage: Uint8Array;

  /**
   * The type of compute.
   *
   * @generated from field: nillion.compute.v1.stream.ComputeType compute_type = 3;
   */
  computeType: ComputeType;
};

/**
 * Describes the message nillion.compute.v1.stream.ComputeStreamMessage.
 * Use `create(ComputeStreamMessageSchema)` to create a new message.
 */
export const ComputeStreamMessageSchema: GenMessage<ComputeStreamMessage> = /*@__PURE__*/
  messageDesc(file_nillion_compute_v1_stream, 0);

/**
 * The type of compute performed. We currently support three types:
 * - GENERAL: A general compute that computes some Nada program.
 * - ECDSA_DKG: A specific compute operation for ECDSA distributed key generation.
 * - EDDSA_DKG: A specific compute operation for Eddsa distributed key generation.
 *
 * @generated from enum nillion.compute.v1.stream.ComputeType
 */
export enum ComputeType {
  /**
   * A general compute.
   *
   * @generated from enum value: GENERAL = 0;
   */
  GENERAL = 0,

  /**
   * An ECDSA distributed key generation protocol.
   *
   * @generated from enum value: ECDSA_DKG = 1;
   */
  ECDSA_DKG = 1,

  /**
   * An Eddsa distributed key generation protocol.
   *
   * @generated from enum value: EDDSA_DKG = 2;
   */
  EDDSA_DKG = 2,
}

/**
 * Describes the enum nillion.compute.v1.stream.ComputeType.
 */
export const ComputeTypeSchema: GenEnum<ComputeType> = /*@__PURE__*/
  enumDesc(file_nillion_compute_v1_stream, 0);

