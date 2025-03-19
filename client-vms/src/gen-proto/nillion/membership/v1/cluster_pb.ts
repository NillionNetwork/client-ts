// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file nillion/membership/v1/cluster.proto (package nillion.membership.v1.cluster, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { PublicKey } from "../../auth/v1/public_key_pb";
import { file_nillion_auth_v1_public_key } from "../../auth/v1/public_key_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file nillion/membership/v1/cluster.proto.
 */
export const file_nillion_membership_v1_cluster: GenFile = /*@__PURE__*/
  fileDesc("CiNuaWxsaW9uL21lbWJlcnNoaXAvdjEvY2x1c3Rlci5wcm90bxIdbmlsbGlvbi5tZW1iZXJzaGlwLnYxLmNsdXN0ZXIi5QEKB0NsdXN0ZXISPQoHbWVtYmVycxgBIAMoCzIsLm5pbGxpb24ubWVtYmVyc2hpcC52MS5jbHVzdGVyLkNsdXN0ZXJNZW1iZXISPAoGbGVhZGVyGAIgASgLMiwubmlsbGlvbi5tZW1iZXJzaGlwLnYxLmNsdXN0ZXIuQ2x1c3Rlck1lbWJlchIzCgVwcmltZRgDIAEoDjIkLm5pbGxpb24ubWVtYmVyc2hpcC52MS5jbHVzdGVyLlByaW1lEhkKEXBvbHlub21pYWxfZGVncmVlGAQgASgNEg0KBWthcHBhGAUgASgNItoBCg1DbHVzdGVyTWVtYmVyEjcKCGlkZW50aXR5GAEgASgLMiUubmlsbGlvbi5tZW1iZXJzaGlwLnYxLmNsdXN0ZXIuTm9kZUlkEjkKCnB1YmxpY19rZXkYAiABKAsyJS5uaWxsaW9uLmF1dGgudjEucHVibGljX2tleS5QdWJsaWNLZXkSFQoNZ3JwY19lbmRwb2ludBgDIAEoCRI+CgtwdWJsaWNfa2V5cxgEIAEoCzIpLm5pbGxpb24ubWVtYmVyc2hpcC52MS5jbHVzdGVyLlB1YmxpY0tleXMiSwoKUHVibGljS2V5cxI9Cg5hdXRoZW50aWNhdGlvbhgBIAEoCzIlLm5pbGxpb24uYXV0aC52MS5wdWJsaWNfa2V5LlB1YmxpY0tleSIaCgZOb2RlSWQSEAoIY29udGVudHMYASABKAwqPwoFUHJpbWUSEAoMU0FGRV82NF9CSVRTEAASEQoNU0FGRV8xMjhfQklUUxABEhEKDVNBRkVfMjU2X0JJVFMQAkLJAQohY29tLm5pbGxpb24ubWVtYmVyc2hpcC52MS5jbHVzdGVyQgxDbHVzdGVyUHJvdG9QAaICBE5NVkOqAh1OaWxsaW9uLk1lbWJlcnNoaXAuVjEuQ2x1c3RlcsoCHU5pbGxpb25cTWVtYmVyc2hpcFxWMVxDbHVzdGVy4gIpTmlsbGlvblxNZW1iZXJzaGlwXFYxXENsdXN0ZXJcR1BCTWV0YWRhdGHqAiBOaWxsaW9uOjpNZW1iZXJzaGlwOjpWMTo6Q2x1c3RlcmIGcHJvdG8z", [file_nillion_auth_v1_public_key]);

/**
 * The definition of a cluster.
 *
 * @generated from message nillion.membership.v1.cluster.Cluster
 */
export type Cluster = Message<"nillion.membership.v1.cluster.Cluster"> & {
  /**
   * The members of this cluster.
   *
   * @generated from field: repeated nillion.membership.v1.cluster.ClusterMember members = 1;
   */
  members: ClusterMember[];

  /**
   * The leader of this cluster.
   *
   * @generated from field: nillion.membership.v1.cluster.ClusterMember leader = 2;
   */
  leader?: ClusterMember;

  /**
   * The prime number this cluster uses.
   *
   * @generated from field: nillion.membership.v1.cluster.Prime prime = 3;
   */
  prime: Prime;

  /**
   * The polynomial degree used in this cluster.
   *
   * @generated from field: uint32 polynomial_degree = 4;
   */
  polynomialDegree: number;

  /**
   * The security parameter kappa used in this cluster.
   *
   * @generated from field: uint32 kappa = 5;
   */
  kappa: number;
};

/**
 * Describes the message nillion.membership.v1.cluster.Cluster.
 * Use `create(ClusterSchema)` to create a new message.
 */
export const ClusterSchema: GenMessage<Cluster> = /*@__PURE__*/
  messageDesc(file_nillion_membership_v1_cluster, 0);

/**
 * A cluster member.
 *
 * @generated from message nillion.membership.v1.cluster.ClusterMember
 */
export type ClusterMember = Message<"nillion.membership.v1.cluster.ClusterMember"> & {
  /**
   * The identity for this member.
   *
   * This is a unique identifier derived from the public key.
   *
   * @generated from field: nillion.membership.v1.cluster.NodeId identity = 1;
   */
  identity?: NodeId;

  /**
   * The public key for this member.
   *
   * **This field is deprecated**. `public_keys.authentication` should be used instead.
   *
   * @generated from field: nillion.auth.v1.public_key.PublicKey public_key = 2;
   */
  publicKey?: PublicKey;

  /**
   * The gRPC endpoint this member can be reached at.
   *
   * @generated from field: string grpc_endpoint = 3;
   */
  grpcEndpoint: string;

  /**
   * The public keys for a cluster member.
   *
   * @generated from field: nillion.membership.v1.cluster.PublicKeys public_keys = 4;
   */
  publicKeys?: PublicKeys;
};

/**
 * Describes the message nillion.membership.v1.cluster.ClusterMember.
 * Use `create(ClusterMemberSchema)` to create a new message.
 */
export const ClusterMemberSchema: GenMessage<ClusterMember> = /*@__PURE__*/
  messageDesc(file_nillion_membership_v1_cluster, 1);

/**
 * The public keys for a cluster member.
 *
 * @generated from message nillion.membership.v1.cluster.PublicKeys
 */
export type PublicKeys = Message<"nillion.membership.v1.cluster.PublicKeys"> & {
  /**
   * The authentication public key for this member.
   *
   * @generated from field: nillion.auth.v1.public_key.PublicKey authentication = 1;
   */
  authentication?: PublicKey;
};

/**
 * Describes the message nillion.membership.v1.cluster.PublicKeys.
 * Use `create(PublicKeysSchema)` to create a new message.
 */
export const PublicKeysSchema: GenMessage<PublicKeys> = /*@__PURE__*/
  messageDesc(file_nillion_membership_v1_cluster, 2);

/**
 * A node identifier.
 *
 * This is currently used from a client perspective when:
 *
 * * Creating an authentication token.
 * * Creating secret shares.
 *
 * @generated from message nillion.membership.v1.cluster.NodeId
 */
export type NodeId = Message<"nillion.membership.v1.cluster.NodeId"> & {
  /**
   * The contents of this node identifier.
   *
   * @generated from field: bytes contents = 1;
   */
  contents: Uint8Array;
};

/**
 * Describes the message nillion.membership.v1.cluster.NodeId.
 * Use `create(NodeIdSchema)` to create a new message.
 */
export const NodeIdSchema: GenMessage<NodeId> = /*@__PURE__*/
  messageDesc(file_nillion_membership_v1_cluster, 3);

/**
 * A prime number.
 *
 * @generated from enum nillion.membership.v1.cluster.Prime
 */
export enum Prime {
  /**
   * A safe 64 bit prime number.
   *
   * This is prime number 18446744072637906947.
   *
   * @generated from enum value: SAFE_64_BITS = 0;
   */
  SAFE_64_BITS = 0,

  /**
   * A safe 128 bit prime number.
   *
   * This is prime number 340282366920938463463374607429104828419.
   *
   * @generated from enum value: SAFE_128_BITS = 1;
   */
  SAFE_128_BITS = 1,

  /**
   * A safe 256 bit prime number.
   *
   * This is prime number 115792089237316195423570985008687907853269984665640564039457584007911397392387.
   *
   * @generated from enum value: SAFE_256_BITS = 2;
   */
  SAFE_256_BITS = 2,
}

/**
 * Describes the enum nillion.membership.v1.cluster.Prime.
 */
export const PrimeSchema: GenEnum<Prime> = /*@__PURE__*/
  enumDesc(file_nillion_membership_v1_cluster, 0);

