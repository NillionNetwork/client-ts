// @generated by protoc-gen-es v2.2.0 with parameter "target=ts"
// @generated from file nillion/permissions/v1/service.proto (package nillion.permissions.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { EmptySchema } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_empty } from "@bufbuild/protobuf/wkt";
import type { PermissionsSchema } from "./permissions_pb";
import { file_nillion_permissions_v1_permissions } from "./permissions_pb";
import type { RetrievePermissionsRequestSchema } from "./retrieve_pb";
import { file_nillion_permissions_v1_retrieve } from "./retrieve_pb";
import type { UpdatePermissionsRequestSchema } from "./update_pb";
import { file_nillion_permissions_v1_update } from "./update_pb";

/**
 * Describes the file nillion/permissions/v1/service.proto.
 */
export const file_nillion_permissions_v1_service: GenFile = /*@__PURE__*/
  fileDesc("CiRuaWxsaW9uL3Blcm1pc3Npb25zL3YxL3NlcnZpY2UucHJvdG8SFm5pbGxpb24ucGVybWlzc2lvbnMudjEy+QEKC1Blcm1pc3Npb25zEoMBChNSZXRyaWV2ZVBlcm1pc3Npb25zEjsubmlsbGlvbi5wZXJtaXNzaW9ucy52MS5yZXRyaWV2ZS5SZXRyaWV2ZVBlcm1pc3Npb25zUmVxdWVzdBovLm5pbGxpb24ucGVybWlzc2lvbnMudjEucGVybWlzc2lvbnMuUGVybWlzc2lvbnMSZAoRVXBkYXRlUGVybWlzc2lvbnMSNy5uaWxsaW9uLnBlcm1pc3Npb25zLnYxLnVwZGF0ZS5VcGRhdGVQZXJtaXNzaW9uc1JlcXVlc3QaFi5nb29nbGUucHJvdG9idWYuRW1wdHlCpAEKGmNvbS5uaWxsaW9uLnBlcm1pc3Npb25zLnYxQgxTZXJ2aWNlUHJvdG9QAaICA05QWKoCFk5pbGxpb24uUGVybWlzc2lvbnMuVjHKAhZOaWxsaW9uXFBlcm1pc3Npb25zXFYx4gIiTmlsbGlvblxQZXJtaXNzaW9uc1xWMVxHUEJNZXRhZGF0YeoCGE5pbGxpb246OlBlcm1pc3Npb25zOjpWMWIGcHJvdG8z", [file_google_protobuf_empty, file_nillion_permissions_v1_permissions, file_nillion_permissions_v1_retrieve, file_nillion_permissions_v1_update]);

/**
 * A service to interact with permissions.
 *
 * @generated from service nillion.permissions.v1.Permissions
 */
export const Permissions: GenService<{
  /**
   * Retrieve the permissions for a set of values.
   *
   * @generated from rpc nillion.permissions.v1.Permissions.RetrievePermissions
   */
  retrievePermissions: {
    methodKind: "unary";
    input: typeof RetrievePermissionsRequestSchema;
    output: typeof PermissionsSchema;
  },
  /**
   * Update the permissions for a set of values.
   *
   * @generated from rpc nillion.permissions.v1.Permissions.UpdatePermissions
   */
  updatePermissions: {
    methodKind: "unary";
    input: typeof UpdatePermissionsRequestSchema;
    output: typeof EmptySchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_nillion_permissions_v1_service, 0);
