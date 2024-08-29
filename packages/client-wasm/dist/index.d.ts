/* tslint:disable */
/* eslint-disable */
/**
* Cluster descriptor
*
* The cluster descriptor contains relevant cluster configuration information.
* This is the structure returned by the `cluster_information` operation in the client.
*
* @hideconstructor
*/
export class ClusterDescriptor {
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
* Cluster identifier
* Returns the cluster identifier as a string.
* @return {string} The cluster identifier
*
* @example
* const descriptor = await nillionClient.cluster_information();
* const id = descriptor.id;
*/
  readonly id: string;
/**
* The security parameter kappa for this cluster.
* @return {number} The security parameter kappa
*
* @example
* const descriptor = await nillionClient.cluster_information();
* const kappa = descriptor.kappa;
*/
  readonly kappa: number;
/**
* Cluster parties
* Returns the parties in the cluster.
* @return {Object} The parties in the cluster
*
* @example
* const descriptor = await nillionClient.cluster_information();
* const parties = descriptor.parties;
*/
  readonly parties: any;
/**
* The prime number to be used in this cluster.
* @return {string} The prime number as a string
*
* @example
* const descriptor = await nillionClient.cluster_information();
* const prime = descriptor.prime;
*/
  readonly prime: string;
}
/**
* @private
*/
export class LoaderHelper {
  free(): void;
/**
* @returns {string}
*/
  mainJS(): string;
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
* Get the number of values.
*
* @example
* const length = values.length;
*/
  readonly length: number;
}
/**
* The Nillion Client
*
* This is the main interface with the Nillion network.
* The Nillion Client provides APIs that you can use for:
* - secure computing in Nillion,
* - storing programs,
* - managing secrets, and
* - managing permissions
*/
export class NillionClient {
  free(): void;
/**
* Creates an instance of Nillion Client
*
* @param {UserKey} user_key - The user private key
* @param {NodeKey} node_key - The node private key
* @param {Array<string>} bootnodes - The Nillion cluster bootnode websocket multiaddresses. A websocket multiaddress has `/ws` or `/wss` (secure sockets) in the address. Example: "/ip4/127.0.0.1/tcp/14211/wss/p2p/12D3KooWCAGu6gqDrkDWWcFnjsT9Y8rUzUH8buWjdFcU3TfWRmuN"
*
* @example
* const user_key = UserKey.generate();
* const node_key = NodeKey.from_seed('your-seed-here');
* const client = new NillionClient(
*     user_key,
*     node_key,
*     bootnodes,
*   );
*/
  constructor(user_key: UserKey, node_key: NodeKey, bootnodes: (string)[]);
/**
* Enable remote logging
*
* Writes client logs to a websocket that can be accessed in URL: ws://127.0.0.1:11100/logs.
* You can use tools like [websocat](https://github.com/vi/websocat) to access and read these logs.
*
* @example
* nillionClient.enable_remote_logging();
*/
  static enable_remote_logging(): void;
/**
* Store values on the Nillion network
*
* @param {string} cluster_id - The targeted cluster identifier
* @param {NadaValues} values - The collection of values to store
* @param {Permissions | undefined} permissions - Optional permissions to be associated with the values. By default the user has full access to them.
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @returns {Promise<string>} A store ID that can be used to retrieve the values.
*
* @example
* const values = new NadaValues();
* values.insert('value1', NadaValue.new_public_integer('1'));
* const store_id = await nillionClient.store_values(cluster_id, values);
*/
  store_values(cluster_id: string, values: NadaValues, permissions: Permissions | undefined, receipt: PaymentReceipt): Promise<string>;
/**
* Retrieve a value already stored in Nillion
*
* @param {string} cluster_id - UUID of the targeted preprocessing cluster
* @param {string} store_id - The store value operation identifier for the values collection that will be retrieved.
* @param {string} value_id - The value identifier inside the values collection
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return {Promise<NadaValue>} - The value identified by `value_id`
*
* @example
* const value = await nillionClient.retrieve_value(cluster_id, store_id, value_id);
*/
  retrieve_value(cluster_id: string, store_id: string, value_id: string, receipt: PaymentReceipt): Promise<NadaValue>;
/**
* Update values stored in the Nillion network
*
* @param {string} cluster_id - UUID of the targeted preprocessing cluster
* @param {string} store_id - The store value operation identifier for the values collection that will be updated.
* @param {NadaValues} values - The new value collection that will replace the existing one
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return {Promise<string>} The unique identifier of the update operation
*
* @example
* const values = new NadaValues();
* values.insert('value1', NadaValue.new_public_integer('2'));
* const action_id = await nillionClient.update_values(cluster_id, store_id, values);
*/
  update_values(cluster_id: string, store_id: string, secrets: NadaValues, receipt: PaymentReceipt): Promise<string>;
/**
* Delete values collection from the network.
*
* @param {string} cluster_id - UUID of the targeted preprocessing cluster
* @param {string} store_id - The store value operation identifier for the values collection that will be deleted.
* @return {Promise}
*
* @example
* await nillionClient.delete_values(cluster_id, store_id);
*/
  delete_values(cluster_id: string, store_id: string): Promise<void>;
/**
* Compute in the Nillion Network. This method invokes the compute operation in the Nillion network.
* It returns a compute ID that can be used by `compute_result` to fetch
* the results of this computation.
*
* @param {string} cluster_id - Identifier of the targeted cluster
* @param {ProgramBindings} bindings - The program bindings for the computation
* @param {Array.<string>} store_ids - The store IDs of the values to use for the computation
* @param {NadaValues} values - Additional values to use for the computation
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return {Promise<string>} A computation UUID.
*
* @example
* const bindings = new ProgramBindings();
* bindings.add_input_party('Party1', '12D3KooWKbs29XBmtXZEFZwHBr39BsgbysPAmAS3RWWdtBBc7joH');
* const values = new NadaValues();
* values.insert('value1', NadaValue.new_public_integer('1'));
* const result_id = await nillionClient.compute(cluster_id, bindings, ['store1'], values);
*/
  compute(cluster_id: string, bindings: ProgramBindings, store_ids: (string)[], values: NadaValues, receipt: PaymentReceipt): Promise<string>;
/**
* Fetch the result of the compute in the Nillion Network
*
* @param {string} result_id - The computation UUID returned after calling `compute`
* @return {Promise<Object>} - The result of the computation
*
* @example
* const result = await nillionClient.compute_result(result_id);
*/
  compute_result(result_id: string): Promise<any>;
/**
* Retrieve permissions for a group of values stored in the Nillion network.
*
* @param {string} cluster_id - The identifier of the target cluster
* @param {string} store_id - The store value identifier for the values collection where the values are
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return {Promise<Permissions>} The permissions associated to the values
*
* @example
* const permissions = await nillionClient.retrieve_permissions(cluster_id, store_id);
*/
  retrieve_permissions(cluster_id: string, store_id: string, receipt: PaymentReceipt): Promise<Permissions>;
/**
* Update permissions for a group of values stored in the Nillion network.
*
* @param {string} cluster_id - The identifier of the target cluster
* @param {string} store_id - The store value identifier for the values collection where the values are
* @param {Permissions} permissions - The permissions that will replace the existing permissions for the values
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return {Promise<string>} The action ID corresponding to the update operation
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* permissions.add_update_permissions(["user_id"]);
* const action_id = await nillionClient.update_permissions(cluster_id, store_id, permissions);
*/
  update_permissions(cluster_id: string, store_id: string, permissions: Permissions, receipt: PaymentReceipt): Promise<string>;
/**
* Store a program in the Nillion Network
*
* @param {string} cluster_id - UUID of the targeted preprocessing cluster
* @param {string} program_name - The name of the program
* @param {UInt8Array} program - The compiled nada program in binary format
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return The program ID associated with the program
*
* @example
* const program_id = await nillionClient.store_program(cluster_id, 'program_name', program);
*/
  store_program(cluster_id: string, program_name: string, program: Uint8Array, receipt: PaymentReceipt): Promise<string>;
/**
* Request a price quote for an operation on the network.
*
* This method asks the network to calculate a price quote for the specified operation. Payment
* and submission of the operation is the client's responsibility and must be done before the
* quote expires.
*
* @param {string} cluster_id - UUID of the targeted preprocessing cluster
* @param {string} operation - The operation to get a quote for.
* @param {PaymentReceipt} receipt - The receipt for the payment made for this operation.
* @return The price quoted for this operation
*
* @example
*     const values = new nillion.NadaValues();
*     values.insert("int", nillion.NadaValue.new_public_integer("42"));
*
*     const operation = nillion.Operation.store_values(values);
*     const quote = await context.client.request_price_quote(
*         context.config.cluster_id,
*         operation,
*     );
*/
  request_price_quote(cluster_id: string, operation: Operation): Promise<PriceQuote>;
/**
* Returns information about a Nillion cluster
*
* @param {string} cluster_id - Identifier of the target cluster
* @return {Promise<ClusterDescriptor>} The cluster descriptor for the given cluster
*
* @example
* const cluster_descriptor = await nillionClient.cluster_information(cluster_id);
*/
  cluster_information(cluster_id: string): Promise<ClusterDescriptor>;
/**
* Enables tracking for the user.
*
* Enables tracking of client actions (store, retrieve, compute ...)
* @return {Promise}
*
* @example
* await nillionClient.enable_tracking();
*/
  static enable_tracking(wallet_addr?: string): void;
/**
* Get the build version of the Nillion client.
*
* @return {string} A string representation of the build version
*
* @example
* const version = nillionClient.build_version;
*/
  static readonly build_version: string;
/**
* Get the party identifier for the current client.
* @return {string} The party identifier for the current client
*
* @example
* const partyId = nillionClient.party_id;
*/
  readonly party_id: string;
/**
* Get the user identifier for the current user.
*
* @return {string} - The Nillion user identifier for the current user
*
* @example
* const userId = nillionClient.user_id;
*/
  readonly user_id: string;
}
/**
* Node key
*
* The node key is used to authenticate the node in the Nillion network.
* The key can be generated from a seed or from a base58 string.
*
* @hideconstructor
* @example
*
* const key = new NodeKey.from_seed("my_seed");
*/
export class NodeKey {
  free(): void;
/**
* Generates a private key using a seed.
*
* @param {string} seed - The seed that will be used to generate the NodeKey
* @return {NodeKey} A NodeKey
*
* @example
*
* const key = new NodeKey.from_seed("my_seed");
*/
  static from_seed(seed: string): NodeKey;
/**
* Decodes a private key from a string encoded in Base58.
*
* @param {string} contents - A base58 string
* @return {NodeKey} An instance of NodeKey matching the string provided
*
* @example
*
* const key = new NodeKey.from_base58(<base 58 encoded data>);
*/
  static from_base58(contents: string): NodeKey;
}
/**
* Operation.
*
* This type represents an operation to be run on the Nillion network.
*
* @hideconstructor
*/
export class Operation {
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
* Create a new store values operation.
*
* @param {NadaValues} values - The values to be stored.
* @param {number} ttl_days - The time to live for the values in days.
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.store_values(values);
* @param {NadaValues} values
* @param {number} ttl_days
* @returns {Operation}
*/
  static store_values(values: NadaValues, ttl_days: number): Operation;
/**
* Create a new update values operation.
*
* @param {NadaValues} values - The values to be updated.
* @param {number} ttl_days - The time to live for the values in days.
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.update_values(values);
* @param {NadaValues} values
* @param {number} ttl_days
* @returns {Operation}
*/
  static update_values(values: NadaValues, ttl_days: number): Operation;
/**
* Create a new compute operation.
*
* @param {string} program_id - The program id to be used.
* @param {NadaValues} values - The values to be used as compute values.
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.compute(values);
* @param {string} program_id
* @param {NadaValues} values
* @returns {Operation}
*/
  static compute(program_id: string, values: NadaValues): Operation;
/**
* Create a new retrieve value operation.
*
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.retrieve_value();
* @returns {Operation}
*/
  static retrieve_value(): Operation;
/**
* Create a new store program operation.
*
* @param {UInt8Array} program - The compiled nada program in binary format
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.store_program();
* @param {Uint8Array} program
* @returns {Operation}
*/
  static store_program(program: Uint8Array): Operation;
/**
* Create a new retrieve permissions operation.
*
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.retrieve_permissions();
* @returns {Operation}
*/
  static retrieve_permissions(): Operation;
/**
* Create a new update permissions operation.
*
* @return {Operation} - The constructed operation.
*
* @example
* const operation = Operation.update_permissions();
* @returns {Operation}
*/
  static update_permissions(): Operation;
}
/**
* The cost of an operation in the network.
*
* @hideconstructor
*/
export class OperationCost {
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
* Gets the cost of the base fee in unil units.
*
* @return {string} - The base fee for this quote.
*
* @example
*     const base_fee = cost.base_fee
*/
  readonly base_fee: string;
/**
* Gets the cost of the compute fee in unil units.
*
* @return {string} - The compute fee for this quote.
*
* @example
*     const compute_fee = cost.compute_fee
*/
  readonly compute_fee: string;
/**
* Gets the cost of the congestion fee in unil units.
*
* @return {string} - The congestion fee for this quote.
*
* @example
*     const congestion_fee = cost.congestion_fee
*/
  readonly congestion_fee: string;
/**
* Gets the cost of the preprocessing fee in unil units.
*
* @return {string} - The preprocessing fee for this quote.
*
* @example
*     const preprocessing_fee = cost.preprocessing_fee
*/
  readonly preprocessing_fee: string;
/**
* Gets the cost of the storage fee in unil units.
*
* @return {string} - The storage fee for this quote.
*
* @example
*     const storage_fee = cost.storage_fee
*/
  readonly storage_fee: string;
/**
* Gets the total cost of the quote in unil units.
* The payment associated for the quoted operation must
* transfer this amount for it to be considered a valid
* payment.
*
* @return {string} - The total cost for this quote.
*
* @example
*     const total = cost.total
*/
  readonly total: string;
}
/**
* Payment receipt.
*
* This type represents a payment receipt for an operation in the Nillion network.
*
* @hideconstructor
*/
export class PaymentReceipt {
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
* Creates an instance of a payment receipt
*
* @param {PriceQuote} quote - The price quote this receipt is for
* @param {string} transaction_hash - The hash of the transaction in which the payment was
* made.
*/
  constructor(quote: PriceQuote, transaction_hash: string);
}
/**
* The permissions data structure.
*
* In Nillion, every stored secret has associated a set of permissions upon creation.
* If no permissions are provided, the network will grant ownership as well as update, delete and retrieve permissions
* to the user storing the secret.
*
* For each compute operation, the secrets need to have granted compute permissions for the program and the user
* accessing the secret for the purpose of a computation.
*
* Permissions for any store value can be updated and retrieved by the owner using `update_permissions` and `retrieve_permissions` operations
* respectively.
*/
export class Permissions {
  free(): void;
/**
* Build a new empty instance of Permissions
*
* @example
* const permissions = new Permissions();
*/
  constructor();
/**
* Builds a new instance of Permissions with the default set for the user identifier.
*
* By default, the user identifier will be granted ownership of the secret as well as full access to the secret.
* No compute permissions are granted by default unless a program is specified. They need to be assigned separately.
*
* @param {string} user_id - The Nillion user identifier
* @returns {Permissions} An instance of Permissions with the default configuration for the user
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
*/
  static default_for_user(user_id: string): Permissions;
/**
* Add retrieve permissions to the Permissions instance for the
* given list of user IDs
*
* @param {Array<string>} user_ids - The list of user identifiers that will be granted retrieve permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* permissions.add_retrieve_permissions(["user_id"]);
*/
  add_retrieve_permissions(user_ids: (string)[]): void;
/**
* Add update permissions to the Permissions instance for the
* given list of user IDs
*
* @param {Array<string>} user_ids - The list of user identifiers that will be granted update permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* permissions.add_update_permissions(["user_id"]);
*/
  add_update_permissions(user_ids: (string)[]): void;
/**
* Add delete permissions to the Permissions instance for the
* given list of user IDs
*
* @param {Array<string>} user_ids - The list of user identifiers that will be granted delete permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* permissions.add_delete_permissions(["user_id"]);
*/
  add_delete_permissions(user_ids: (string)[]): void;
/**
* Add compute permissions to the Permissions instance for the
* given list of user IDs
*
* @param {any} permissions - object where the keys are the user identities and for each key the values are a list of program identifiers that
*     user will be granted compute permission for.
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* permissions.add_compute_permissions({
*     "user_id": ["program_id"]
* });
*/
  add_compute_permissions(permissions: any): void;
/**
* Returns true if user has retrieve permissions
*
* @param {string} user_id - the user identifier
* @return {boolean} true if the user has retrieve permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* const retrieve_allowed = permissions.is_retrieve_allowed("user_id");
*/
  is_retrieve_allowed(user_id: string): boolean;
/**
* Returns true if user has update permissions
*
* @param {string} user_id - the user identifier
* @return {boolean} true if the user has update permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* const update_allowed = permissions.is_update_allowed("user_id");
*/
  is_update_allowed(user_id: string): boolean;
/**
* Returns true if user has delete permissions
*
* @param {string} user_id - the user identifier
* @return {boolean} true if the user has delete permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* const delete_allowed = permissions.is_delete_allowed("user_id");
*/
  is_delete_allowed(user_id: string): boolean;
/**
* Returns true if user has compute permissions for every single program
*
* @param {string} user_id - the user identifier
* @param {string} program - the program identifier
* @return {boolean} true if the user has compute permissions
*
* @example
* const permissions = Permissions.default_for_user(nillionClient.user_id);
* const compute_allowed = permissions.is_compute_allowed("user_id", "program_id");
*/
  is_compute_allowed(user_id: string, program: string): boolean;
}
/**
* The pre-processing protocol configuration
* @hideconstructor
*/
export class PreprocessingProtocolConfig {
  free(): void;
/**
* The number of elements to be generated on every run.
*
* @example
* const descriptor = await nillionClient.cluster_information();
* const preprocessing = descriptor.preprocessing;
* const lambda = preprocessing.lambda;
* const batch_size = lambda.batch_size;
*/
  readonly batch_size: number;
}
/**
* Price quote.
*
* This type represents a price quote for an operation in the Nillion network.
*
* @hideconstructor
*/
export class PriceQuote {
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
* Gets the cost for the quoted operation in unil units. The payment associated for the quoted operation must
* transfer this amount for it to be considered a valid payment.
*
* @return {OperationCost} - The cost for this quote.
*
* @example
* const cost = quote.cost;
*/
  readonly cost: OperationCost;
/**
* Get the expiration time for this price quote.
*
* The payment and the operation execution must be invoked before this deadline is
* hit, otherwise the network will reject the operation request.
*
* @return {Date} - The expiration time.
*
* @example
* const expiration_time = quote.expires_at;
*/
  readonly expires_at: Date;
/**
* Gets the nonce for this quote. This nonce must be used as part of the payment transaction.
*
* @example
* const nonce = quote.nonce;
*/
  readonly nonce: Uint8Array;
}
/**
* Program Bindings
*/
export class ProgramBindings {
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
* Creates a new ProgramBindings
*
* @param {string} program_id - A program identifier, this is usually the given name of the program
* @return {ProgramBindings} A new instance of ProgramBindings
*
* @example
* const bindings = new ProgramBindings("simple_program");
*/
  constructor(program_id: string);
/**
* Bind an input party with a name
*
* @param {string} name - Name of the input party
* @param {string} id - Identifier of the party
*
* @example
* bindings.add_input_party("Party1", "12D3KooWKbs29XBmtXZEFZwHBr39BsgbysPAmAS3RWWdtBBc7joH");
*/
  add_input_party(name: string, id: string): void;
/**
* Bind an output party with a name
*
* @param {string} name - Name of the input party
* @param {string} id - Identifier of the party
*
* @example
* bindings.add_output_party("Party2", "12D3KooWKbs29XBmtXZEFZwHBr39BsgbysPAmAS3RWWdtBBc7joH");
*/
  add_output_party(name: string, id: string): void;
}
/**
* User key
*
* The user key is used as the user identity in the Nillion network.
* The key can be generated from a seed or from a base58 string.
*
* @hideconstructor
* @example
*
* const key = new UserKey.from_seed("my_seed");
*/
export class UserKey {
  free(): void;
/**
* Generate a new random public/private key.
* Uses a cryptographically secure pseudo-random number generator.
*
* @return {UserKey} a new instance of UserKey
*
* @example
*
* const key = new UserKey.generate();
*/
  static generate(): UserKey;
/**
* Generate a new public/private key.
* Uses a seed to generate the keys via a cryptographically secure pseudo-random number generator.
*
* @param {string} seed - The seed that will be used to generate the key
*
* @return {UserKey} The user key generated using the seed provided
*
* @example
*
* const key = new UserKey.from_seed("my_seed");
*/
  static from_seed(seed: string): UserKey;
/**
* Returns the public key corresponding to this key.
*
* @return {string} The public key as an UTF-8 encoded string.
*
* @example
*
* const key = new UserKey.from_seed("my_seed");
* const public_key = key.public_key();
*/
  public_key(): string;
/**
* Decodes a UserKey from a Base58-encoded String
*
* @param {string} contents - The private key encoded in Base58 format
* @return {UserKey} The decoded instance of UserKey
*
* @example
*
* const key = new UserKey.from_base58(<base 58 encoded data>);
*/
  static from_base58(contents: string): UserKey;
/**
* Returns the key in Base58 encoded form.
*
* @return {string} the key encoded as a Base58 string
* @example
*
* const key = new UserKey.from_seed("my_seed");
* const base58_key = key.to_base58();
*/
  to_base58(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly __wbg_loaderhelper_free: (a: number) => void;
  readonly loaderhelper_mainJS: (a: number) => number;
  readonly worker_entry_point: (a: number) => void;
  readonly __wbg_nillionclient_free: (a: number) => void;
  readonly nillionclient_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly nillionclient_enable_remote_logging: () => void;
  readonly nillionclient_party_id: (a: number, b: number) => void;
  readonly nillionclient_user_id: (a: number, b: number) => void;
  readonly nillionclient_store_values: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly nillionclient_retrieve_value: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly nillionclient_update_values: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly nillionclient_delete_values: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly nillionclient_compute: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly nillionclient_compute_result: (a: number, b: number, c: number) => number;
  readonly nillionclient_retrieve_permissions: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly nillionclient_update_permissions: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly nillionclient_store_program: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly nillionclient_request_price_quote: (a: number, b: number, c: number, d: number) => number;
  readonly nillionclient_cluster_information: (a: number, b: number, c: number) => number;
  readonly nillionclient_enable_tracking: (a: number, b: number, c: number) => void;
  readonly nillionclient_build_version: (a: number) => void;
  readonly __wbg_pricequote_free: (a: number) => void;
  readonly pricequote_expires_at: (a: number) => number;
  readonly pricequote_cost: (a: number) => number;
  readonly pricequote_nonce: (a: number, b: number) => void;
  readonly __wbg_operationcost_free: (a: number) => void;
  readonly operationcost_base_fee: (a: number, b: number) => void;
  readonly operationcost_congestion_fee: (a: number, b: number) => void;
  readonly operationcost_storage_fee: (a: number, b: number) => void;
  readonly operationcost_preprocessing_fee: (a: number, b: number) => void;
  readonly operationcost_compute_fee: (a: number, b: number) => void;
  readonly operationcost_total: (a: number, b: number) => void;
  readonly __wbg_paymentreceipt_free: (a: number) => void;
  readonly paymentreceipt_new: (a: number, b: number, c: number) => number;
  readonly __wbg_nodekey_free: (a: number) => void;
  readonly nodekey_from_seed: (a: number, b: number) => number;
  readonly nodekey_from_base58: (a: number, b: number) => number;
  readonly __wbg_userkey_free: (a: number) => void;
  readonly userkey_generate: () => number;
  readonly userkey_from_seed: (a: number, b: number, c: number) => void;
  readonly userkey_public_key: (a: number, b: number) => void;
  readonly userkey_from_base58: (a: number, b: number, c: number) => void;
  readonly userkey_to_base58: (a: number, b: number) => void;
  readonly __wbg_operation_free: (a: number) => void;
  readonly operation_store_values: (a: number, b: number, c: number) => void;
  readonly operation_update_values: (a: number, b: number, c: number) => void;
  readonly operation_compute: (a: number, b: number, c: number) => number;
  readonly operation_retrieve_value: () => number;
  readonly operation_store_program: (a: number, b: number, c: number) => void;
  readonly operation_retrieve_permissions: () => number;
  readonly operation_update_permissions: () => number;
  readonly __wbg_permissions_free: (a: number) => void;
  readonly permissions_new: () => number;
  readonly permissions_default_for_user: (a: number, b: number) => number;
  readonly permissions_add_retrieve_permissions: (a: number, b: number, c: number, d: number) => void;
  readonly permissions_add_update_permissions: (a: number, b: number, c: number, d: number) => void;
  readonly permissions_add_delete_permissions: (a: number, b: number, c: number, d: number) => void;
  readonly permissions_add_compute_permissions: (a: number, b: number, c: number) => void;
  readonly permissions_is_retrieve_allowed: (a: number, b: number, c: number) => number;
  readonly permissions_is_update_allowed: (a: number, b: number, c: number) => number;
  readonly permissions_is_delete_allowed: (a: number, b: number, c: number) => number;
  readonly permissions_is_compute_allowed: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbg_programbindings_free: (a: number) => void;
  readonly programbindings_new: (a: number, b: number, c: number) => void;
  readonly programbindings_add_input_party: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly programbindings_add_output_party: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbg_clusterdescriptor_free: (a: number) => void;
  readonly clusterdescriptor_id: (a: number, b: number) => void;
  readonly clusterdescriptor_parties: (a: number, b: number) => void;
  readonly clusterdescriptor_prime: (a: number, b: number) => void;
  readonly clusterdescriptor_kappa: (a: number) => number;
  readonly __wbg_preprocessingprotocolconfig_free: (a: number) => void;
  readonly preprocessingprotocolconfig_batch_size: (a: number) => number;
  readonly __wbg_nadavalue_free: (a: number) => void;
  readonly nadavalue_new_secret_integer: (a: number, b: number, c: number) => void;
  readonly nadavalue_new_secret_unsigned_integer: (a: number, b: number, c: number) => void;
  readonly nadavalue_new_secret_blob: (a: number, b: number) => number;
  readonly nadavalue_new_public_integer: (a: number, b: number, c: number) => void;
  readonly nadavalue_new_public_unsigned_integer: (a: number, b: number, c: number) => void;
  readonly nadavalue_to_byte_array: (a: number, b: number) => void;
  readonly nadavalue_to_integer: (a: number, b: number) => void;
  readonly __wbg_nadavalues_free: (a: number) => void;
  readonly nadavalues_new: (a: number) => void;
  readonly nadavalues_insert: (a: number, b: number, c: number, d: number) => void;
  readonly nadavalues_length: (a: number) => number;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2ab2b16fa3ecb39d: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h122124be45102e22: (a: number, b: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__hb30b10b3ecc70f29: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput, maybe_memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>, maybe_memory?: WebAssembly.Memory): Promise<InitOutput>;
