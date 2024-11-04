// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file nillion/preprocessing/v1/generate.proto (package nillion.preprocessing.v1.generate, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { PreprocessingElement } from "./element_pb";
import { file_nillion_preprocessing_v1_element } from "./element_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file nillion/preprocessing/v1/generate.proto.
 */
export const file_nillion_preprocessing_v1_generate: GenFile = /*@__PURE__*/
  fileDesc("CiduaWxsaW9uL3ByZXByb2Nlc3NpbmcvdjEvZ2VuZXJhdGUucHJvdG8SIW5pbGxpb24ucHJlcHJvY2Vzc2luZy52MS5nZW5lcmF0ZSKkAQocR2VuZXJhdGVQcmVwcm9jZXNzaW5nUmVxdWVzdBIVCg1nZW5lcmF0aW9uX2lkGAEgASgMEhAKCGJhdGNoX2lkGAIgASgEEhIKCmJhdGNoX3NpemUYAyABKA0SRwoHZWxlbWVudBgEIAEoDjI2Lm5pbGxpb24ucHJlcHJvY2Vzc2luZy52MS5lbGVtZW50LlByZXByb2Nlc3NpbmdFbGVtZW50Im8KHUdlbmVyYXRlUHJlcHJvY2Vzc2luZ1Jlc3BvbnNlEk4KBnN0YXR1cxgBIAEoDjI+Lm5pbGxpb24ucHJlcHJvY2Vzc2luZy52MS5nZW5lcmF0ZS5QcmVwcm9jZXNzaW5nUHJvdG9jb2xTdGF0dXMqXAobUHJlcHJvY2Vzc2luZ1Byb3RvY29sU3RhdHVzEhEKDVdBSVRJTkdfUEVFUlMQABIUChBGSU5JU0hFRF9TVUNDRVNTEAESFAoQRklOSVNIRURfRkFJTFVSRRACQt4BCiVjb20ubmlsbGlvbi5wcmVwcm9jZXNzaW5nLnYxLmdlbmVyYXRlQg1HZW5lcmF0ZVByb3RvUAGiAgROUFZHqgIhTmlsbGlvbi5QcmVwcm9jZXNzaW5nLlYxLkdlbmVyYXRlygIhTmlsbGlvblxQcmVwcm9jZXNzaW5nXFYxXEdlbmVyYXRl4gItTmlsbGlvblxQcmVwcm9jZXNzaW5nXFYxXEdlbmVyYXRlXEdQQk1ldGFkYXRh6gIkTmlsbGlvbjo6UHJlcHJvY2Vzc2luZzo6VjE6OkdlbmVyYXRlYgZwcm90bzM", [file_nillion_preprocessing_v1_element]);

/**
 * A request to generate preprocessing material.
 *
 * @generated from message nillion.preprocessing.v1.generate.GeneratePreprocessingRequest
 */
export type GeneratePreprocessingRequest = Message<"nillion.preprocessing.v1.generate.GeneratePreprocessingRequest"> & {
  /**
   * An identifier for this generation instance.
   *
   * @generated from field: bytes generation_id = 1;
   */
  generationId: Uint8Array;

  /**
   * The batch id that is being generated.
   *
   * This is a sequential number per preprocessing element.
   *
   * @generated from field: uint64 batch_id = 2;
   */
  batchId: bigint;

  /**
   * The number of elements being generated.
   *
   * @generated from field: uint32 batch_size = 3;
   */
  batchSize: number;

  /**
   * The preprocessing element being generated.
   *
   * @generated from field: nillion.preprocessing.v1.element.PreprocessingElement element = 4;
   */
  element: PreprocessingElement;
};

/**
 * Describes the message nillion.preprocessing.v1.generate.GeneratePreprocessingRequest.
 * Use `create(GeneratePreprocessingRequestSchema)` to create a new message.
 */
export const GeneratePreprocessingRequestSchema: GenMessage<GeneratePreprocessingRequest> = /*@__PURE__*/
  messageDesc(file_nillion_preprocessing_v1_generate, 0);

/**
 * A response to a request to generate preprocessing material.
 *
 * @generated from message nillion.preprocessing.v1.generate.GeneratePreprocessingResponse
 */
export type GeneratePreprocessingResponse = Message<"nillion.preprocessing.v1.generate.GeneratePreprocessingResponse"> & {
  /**
   * The status of the preprocessing protocol.
   *
   * @generated from field: nillion.preprocessing.v1.generate.PreprocessingProtocolStatus status = 1;
   */
  status: PreprocessingProtocolStatus;
};

/**
 * Describes the message nillion.preprocessing.v1.generate.GeneratePreprocessingResponse.
 * Use `create(GeneratePreprocessingResponseSchema)` to create a new message.
 */
export const GeneratePreprocessingResponseSchema: GenMessage<GeneratePreprocessingResponse> = /*@__PURE__*/
  messageDesc(file_nillion_preprocessing_v1_generate, 1);

/**
 * The status of a preprocessing protocol execution.
 *
 * @generated from enum nillion.preprocessing.v1.generate.PreprocessingProtocolStatus
 */
export enum PreprocessingProtocolStatus {
  /**
   * The protocol is waiting for peer initialization.
   *
   * @generated from enum value: WAITING_PEERS = 0;
   */
  WAITING_PEERS = 0,

  /**
   * The protocol finished successfully.
   *
   * @generated from enum value: FINISHED_SUCCESS = 1;
   */
  FINISHED_SUCCESS = 1,

  /**
   * The protocol finished with an error.
   *
   * @generated from enum value: FINISHED_FAILURE = 2;
   */
  FINISHED_FAILURE = 2,
}

/**
 * Describes the enum nillion.preprocessing.v1.generate.PreprocessingProtocolStatus.
 */
export const PreprocessingProtocolStatusSchema: GenEnum<PreprocessingProtocolStatus> = /*@__PURE__*/
  enumDesc(file_nillion_preprocessing_v1_generate, 0);

