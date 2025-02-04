// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file nillion/preprocessing/v1/service.proto (package nillion.preprocessing.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { EmptySchema } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_empty } from "@bufbuild/protobuf/wkt";
import type { GenerateAuxiliaryMaterialRequestSchema, GenerateAuxiliaryMaterialResponseSchema, GeneratePreprocessingRequestSchema, GeneratePreprocessingResponseSchema } from "./generate_pb";
import { file_nillion_preprocessing_v1_generate } from "./generate_pb";
import type { AuxiliaryMaterialStreamMessageSchema, PreprocessingStreamMessageSchema } from "./stream_pb";
import { file_nillion_preprocessing_v1_stream } from "./stream_pb";
import type { CleanupUsedElementsRequestSchema } from "./cleanup_pb";
import { file_nillion_preprocessing_v1_cleanup } from "./cleanup_pb";

/**
 * Describes the file nillion/preprocessing/v1/service.proto.
 */
export const file_nillion_preprocessing_v1_service: GenFile = /*@__PURE__*/
  fileDesc("CiZuaWxsaW9uL3ByZXByb2Nlc3NpbmcvdjEvc2VydmljZS5wcm90bxIYbmlsbGlvbi5wcmVwcm9jZXNzaW5nLnYxMqoFCg1QcmVwcm9jZXNzaW5nEpwBChVHZW5lcmF0ZVByZXByb2Nlc3NpbmcSPy5uaWxsaW9uLnByZXByb2Nlc3NpbmcudjEuZ2VuZXJhdGUuR2VuZXJhdGVQcmVwcm9jZXNzaW5nUmVxdWVzdBpALm5pbGxpb24ucHJlcHJvY2Vzc2luZy52MS5nZW5lcmF0ZS5HZW5lcmF0ZVByZXByb2Nlc3NpbmdSZXNwb25zZTABEqgBChlHZW5lcmF0ZUF1eGlsaWFyeU1hdGVyaWFsEkMubmlsbGlvbi5wcmVwcm9jZXNzaW5nLnYxLmdlbmVyYXRlLkdlbmVyYXRlQXV4aWxpYXJ5TWF0ZXJpYWxSZXF1ZXN0GkQubmlsbGlvbi5wcmVwcm9jZXNzaW5nLnYxLmdlbmVyYXRlLkdlbmVyYXRlQXV4aWxpYXJ5TWF0ZXJpYWxSZXNwb25zZTABEmwKE1N0cmVhbVByZXByb2Nlc3NpbmcSOy5uaWxsaW9uLnByZXByb2Nlc3NpbmcudjEuc3RyZWFtLlByZXByb2Nlc3NpbmdTdHJlYW1NZXNzYWdlGhYuZ29vZ2xlLnByb3RvYnVmLkVtcHR5KAESdAoXU3RyZWFtQXV4aWxpYXJ5TWF0ZXJpYWwSPy5uaWxsaW9uLnByZXByb2Nlc3NpbmcudjEuc3RyZWFtLkF1eGlsaWFyeU1hdGVyaWFsU3RyZWFtTWVzc2FnZRoWLmdvb2dsZS5wcm90b2J1Zi5FbXB0eSgBEmsKE0NsZWFudXBVc2VkRWxlbWVudHMSPC5uaWxsaW9uLnByZXByb2Nlc3NpbmcudjEuY2xlYW51cC5DbGVhbnVwVXNlZEVsZW1lbnRzUmVxdWVzdBoWLmdvb2dsZS5wcm90b2J1Zi5FbXB0eUKuAQocY29tLm5pbGxpb24ucHJlcHJvY2Vzc2luZy52MUIMU2VydmljZVByb3RvUAGiAgNOUFiqAhhOaWxsaW9uLlByZXByb2Nlc3NpbmcuVjHKAhhOaWxsaW9uXFByZXByb2Nlc3NpbmdcVjHiAiROaWxsaW9uXFByZXByb2Nlc3NpbmdcVjFcR1BCTWV0YWRhdGHqAhpOaWxsaW9uOjpQcmVwcm9jZXNzaW5nOjpWMWIGcHJvdG8z", [file_google_protobuf_empty, file_nillion_preprocessing_v1_generate, file_nillion_preprocessing_v1_stream, file_nillion_preprocessing_v1_cleanup]);

/**
 * A service to run preprocessing related actions.
 *
 * @generated from service nillion.preprocessing.v1.Preprocessing
 */
export const Preprocessing: GenService<{
  /**
   * Trigger the generation of preprocessing material.
   *
   * Preprocessing material is used to speed up the online phase for certain operations in MPC programs.
   *
   * @generated from rpc nillion.preprocessing.v1.Preprocessing.GeneratePreprocessing
   */
  generatePreprocessing: {
    methodKind: "server_streaming";
    input: typeof GeneratePreprocessingRequestSchema;
    output: typeof GeneratePreprocessingResponseSchema;
  },
  /**
   * Trigger the generation of auxiliary material.
   *
   * The distinction between preprocessing and auxiliary material is preprocessing is consumed when certain
   * programs are ran while auxiliary material is generated once when the network starts for the first time and
   * is never consumed unless there's a reason to regenerate it.
   *
   * @generated from rpc nillion.preprocessing.v1.Preprocessing.GenerateAuxiliaryMaterial
   */
  generateAuxiliaryMaterial: {
    methodKind: "server_streaming";
    input: typeof GenerateAuxiliaryMaterialRequestSchema;
    output: typeof GenerateAuxiliaryMaterialResponseSchema;
  },
  /**
   * Open a stream to generate a preprocessing element.
   *
   * @generated from rpc nillion.preprocessing.v1.Preprocessing.StreamPreprocessing
   */
  streamPreprocessing: {
    methodKind: "client_streaming";
    input: typeof PreprocessingStreamMessageSchema;
    output: typeof EmptySchema;
  },
  /**
   * Open a stream to generate auxiliary material.
   *
   * @generated from rpc nillion.preprocessing.v1.Preprocessing.StreamAuxiliaryMaterial
   */
  streamAuxiliaryMaterial: {
    methodKind: "client_streaming";
    input: typeof AuxiliaryMaterialStreamMessageSchema;
    output: typeof EmptySchema;
  },
  /**
   * Cleanup used preprocessing chunks.
   *
   * @generated from rpc nillion.preprocessing.v1.Preprocessing.CleanupUsedElements
   */
  cleanupUsedElements: {
    methodKind: "unary";
    input: typeof CleanupUsedElementsRequestSchema;
    output: typeof EmptySchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_nillion_preprocessing_v1_service, 0);

