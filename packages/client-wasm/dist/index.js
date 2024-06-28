import { startWorker } from './snippets/browser-async-executor-b51ed65827bac93b/src/worker.js';
import { websocket_transport } from './snippets/libp2p-wasm-ext-7e5f5edb880ee0f5/src/websockets.js';

let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.buffer !== wasm.memory.buffer) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().slice(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};

function passStringToWasm0(arg, malloc, realloc) {

    if (typeof(arg) !== 'string') throw new Error(`expected a string argument, found ${typeof(arg)}`);

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.buffer !== wasm.memory.buffer) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error(`expected a number argument, found ${typeof(n)}`);
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error(`expected a boolean argument, found ${typeof(n)}`);
    }
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_3.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_3.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function logError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        let error = (function () {
            try {
                return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
            } catch(_) {
                return "<failed to stringify thrown value>";
            }
        }());
        console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
        throw e;
    }
}
function __wbg_adapter_46(arg0, arg1) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h089cb3535dd8fbe9(arg0, arg1);
}

function __wbg_adapter_49(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd01180835a937fda(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_52(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb870b5d1259d419e(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_55(arg0, arg1) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9bbab91913200b63(arg0, arg1);
}

function __wbg_adapter_58(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hdbc9ec6d754eb0ec(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_61(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h66d0f6349ee727e6(arg0, arg1, addHeapObject(arg2));
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.buffer !== wasm.memory.buffer) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* Entry point invoked by the web worker. The passed pointer will be unconditionally interpreted
* as an `Box::<(WorkerExecutor, Worker)>`.
* @private
* @param {number} shared_state_ptr
*/
export function worker_entry_point(shared_state_ptr) {
    _assertNum(shared_state_ptr);
    wasm.worker_entry_point(shared_state_ptr);
}

function __wbg_adapter_353(arg0, arg1, arg2, arg3) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm.wasm_bindgen__convert__closures__invoke2_mut__hf9705df32af46fe3(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const ClusterDescriptorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_clusterdescriptor_free(ptr >>> 0));
/**
* Cluster descriptor
*
* The cluster descriptor contains relevant cluster configuration information.
* This is the structure returned by the `cluster_information` operation in the client.
*
* @hideconstructor
*/
export class ClusterDescriptor {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ClusterDescriptor.prototype);
        obj.__wbg_ptr = ptr;
        ClusterDescriptorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            id: this.id,
            parties: this.parties,
            prime: this.prime,
            kappa: this.kappa,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ClusterDescriptorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_clusterdescriptor_free(ptr);
    }
    /**
    * Cluster identifier
    * Returns the cluster identifier as a string.
    * @return {string} The cluster identifier
    *
    * @example
    * const descriptor = await nillionClient.cluster_information();
    * const id = descriptor.id;
    * @returns {string}
    */
    get id() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.clusterdescriptor_id(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Cluster parties
    * Returns the parties in the cluster.
    * @return {Object} The parties in the cluster
    *
    * @example
    * const descriptor = await nillionClient.cluster_information();
    * const parties = descriptor.parties;
    * @returns {any}
    */
    get parties() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.clusterdescriptor_parties(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * The prime number to be used in this cluster.
    * @return {string} The prime number as a string
    *
    * @example
    * const descriptor = await nillionClient.cluster_information();
    * const prime = descriptor.prime;
    * @returns {string}
    */
    get prime() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.clusterdescriptor_prime(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * The security parameter kappa for this cluster.
    * @return {number} The security parameter kappa
    *
    * @example
    * const descriptor = await nillionClient.cluster_information();
    * const kappa = descriptor.kappa;
    * @returns {number}
    */
    get kappa() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.clusterdescriptor_kappa(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const LoaderHelperFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_loaderhelper_free(ptr >>> 0));
/**
* @private
*/
export class LoaderHelper {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LoaderHelper.prototype);
        obj.__wbg_ptr = ptr;
        LoaderHelperFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LoaderHelperFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_loaderhelper_free(ptr);
    }
    /**
    * @returns {string}
    */
    mainJS() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.loaderhelper_mainJS(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const NadaValueFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nadavalue_free(ptr >>> 0));
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

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NadaValue.prototype);
        obj.__wbg_ptr = ptr;
        NadaValueFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NadaValueFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nadavalue_free(ptr);
    }
    /**
    * Create a new secret integer value.
    *
    * @param {string} value - The value must be a valid string representation of an integer.
    * @return {NadaValue} The encoded secret corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_secret_integer("-23");
    */
    static new_secret_integer(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_secret_integer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new secret unsigned integer value.
    *
    * @param {string} value - The value must be a valid string representation of an unsigned integer.
    * @return {NadaValue} The encoded secret corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_secret_unsigned_integer("23");
    */
    static new_secret_unsigned_integer(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_secret_unsigned_integer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new non-zero secret integer.
    *
    * @param {string} value - The value must be a valid string representation of an integer.
    * @return {NadaValue} The encoded secret corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_secret_non_zero_integer("-23");
    */
    static new_secret_non_zero_integer(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_secret_non_zero_integer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new non-zero secret unsigned integer.
    *
    * @param {string} value - The value must be a valid string representation of an unsigned integer.
    * @return {NadaValue} The encoded secret corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_non_zero_unsigned_integer("23");
    */
    static new_secret_non_zero_unsigned_integer(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_secret_non_zero_unsigned_integer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new secret blob.
    *
    * @param {Uint8Array} value - The blob in binary (byte array) encoded format
    * @return {NadaValue} The encoded secret corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_secret_blob([1,0,1,222,21]);
    */
    static new_secret_blob(value) {
        const ptr0 = passArray8ToWasm0(value, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nadavalue_new_secret_blob(ptr0, len0);
        return NadaValue.__wrap(ret);
    }
    /**
    * Create a new public integer with the provided value.
    *
    * @param {string} value - The value must be a valid string representation of an integer.
    * @return {NadaValue} The encoded public variable corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_public_integer("-23");
    */
    static new_public_integer(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_public_integer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new public unsigned integer with the provided value.
    *
    * @param {string} value - The value must be a valid string representation of an unsigned integer.
    * @return {NadaValue} The encoded public variable corresponding to the value provided
    *
    * @example
    * const value = NadaValue.new_public_unsigned_integer("23");
    */
    static new_public_unsigned_integer(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_public_unsigned_integer(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    to_byte_array() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.nadavalue_to_byte_array(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    to_integer() {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.nadavalue_to_integer(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}

const NadaValuesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nadavalues_free(ptr >>> 0));
/**
* A collection of named values.
*/
export class NadaValues {

    toJSON() {
        return {
            length: this.length,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NadaValuesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nadavalues_free(ptr);
    }
    /**
    * Creates a new empty instance of NadaValues.
    *
    * @example
    * const values = new NadaValues();
    */
    constructor() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalues_new(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Add an encoded value to the NadaValues collection.
    *
    * @param {string} name - The name of the value
    * @param {NadaValue} input - The value to be added
    *
    * @example
    * values.insert("my_value", NadaValue.new_public_integer("23"));
    */
    insert(name, input) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(input, NadaValue);
        if (input.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.nadavalues_insert(this.__wbg_ptr, ptr0, len0, input.__wbg_ptr);
    }
    /**
    * Get the number of values.
    *
    * @example
    * const length = values.length;
    * @returns {number}
    */
    get length() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.nadavalues_length(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const NillionClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nillionclient_free(ptr >>> 0));
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

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NillionClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nillionclient_free(ptr);
    }
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
    constructor(user_key, node_key, bootnodes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(user_key, UserKey);
            if (user_key.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            var ptr0 = user_key.__destroy_into_raw();
            _assertClass(node_key, NodeKey);
            if (node_key.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            var ptr1 = node_key.__destroy_into_raw();
            const ptr2 = passArrayJsValueToWasm0(bootnodes, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            wasm.nillionclient_new(retptr, ptr0, ptr1, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Enable remote logging
    *
    * Writes client logs to a websocket that can be accessed in URL: ws://127.0.0.1:11100/logs.
    * You can use tools like [websocat](https://github.com/vi/websocat) to access and read these logs.
    *
    * @example
    * nillionClient.enable_remote_logging();
    */
    static enable_remote_logging() {
        wasm.nillionclient_enable_remote_logging();
    }
    /**
    * Get the party identifier for the current client.
    * @return {string} The party identifier for the current client
    *
    * @example
    * const partyId = nillionClient.party_id;
    */
    get party_id() {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.nillionclient_party_id(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
    * Get the user identifier for the current user.
    *
    * @return {string} - The Nillion user identifier for the current user
    *
    * @example
    * const userId = nillionClient.user_id;
    */
    get user_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.nillionclient_user_id(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Store values on the Nillion network
    *
    * @param {string} cluster_id - The targeted cluster identifier
    * @param {NadaValues} values - The collection of values to store
    * @param {Permissions | undefined} permissions - Optional permissions to be associated with the values. By default the user has full access to them.
    * @returns {Promise<string>} A store ID that can be used to retrieve the values.
    *
    * @example
    * const values = new NadaValues();
    * values.insert('value1', NadaValue.new_public_integer('1'));
    * const store_id = await nillionClient.store_values(cluster_id, values);
    */
    store_values(cluster_id, values, permissions, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(values, NadaValues);
        if (values.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        let ptr1 = 0;
        if (!isLikeNone(permissions)) {
            _assertClass(permissions, Permissions);
            if (permissions.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            ptr1 = permissions.__destroy_into_raw();
        }
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_store_values(this.__wbg_ptr, ptr0, len0, values.__wbg_ptr, ptr1, receipt.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Retrieve a value already stored in Nillion
    *
    * @param {string} cluster_id - UUID of the targeted preprocessing cluster
    * @param {string} store_id - The store value operation identifier for the values collection that will be retrieved.
    * @param {string} value_id - The value identifier inside the values collection
    * @return {Promise<NadaValue>} - The value identified by `value_id`
    *
    * @example
    * const value = await nillionClient.retrieve_value(cluster_id, store_id, value_id);
    */
    retrieve_value(cluster_id, store_id, value_id, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(store_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(value_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_retrieve_value(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, receipt.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Update values stored in the Nillion network
    *
    * @param {string} cluster_id - UUID of the targeted preprocessing cluster
    * @param {string} store_id - The store value operation identifier for the values collection that will be updated.
    * @param {NadaValues} values - The new value collection that will replace the existing one
    * @return {Promise<string>} The unique identifier of the update operation
    *
    * @example
    * const values = new NadaValues();
    * values.insert('value1', NadaValue.new_public_integer('2'));
    * const action_id = await nillionClient.update_values(cluster_id, store_id, values);
    */
    update_values(cluster_id, store_id, secrets, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(store_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(secrets, NadaValues);
        if (secrets.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_update_values(this.__wbg_ptr, ptr0, len0, ptr1, len1, secrets.__wbg_ptr, receipt.__wbg_ptr);
        return takeObject(ret);
    }
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
    delete_values(cluster_id, store_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(store_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.nillionclient_delete_values(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Compute in the Nillion Network. This method invokes the compute operation in the Nillion network.
    * It returns a compute ID that can be used by `compute_result` to fetch
    * the results of this computation.
    *
    * @param {string} cluster_id - Identifier of the targeted cluster
    * @param {ProgramBindings} bindings - The program bindings for the computation
    * @param {Array.<string>} store_ids - The store IDs of the values to use for the computation
    * @param {NadaValues} values - Additional values to use for the computation
    * @return {Promise<string>} A computation UUID.
    *
    * @example
    * const bindings = new ProgramBindings();
    * bindings.add_input_party('Party1', '12D3KooWKbs29XBmtXZEFZwHBr39BsgbysPAmAS3RWWdtBBc7joH');
    * const values = new NadaValues();
    * values.insert('value1', NadaValue.new_public_integer('1'));
    * const result_id = await nillionClient.compute(cluster_id, bindings, ['store1'], values);
    */
    compute(cluster_id, bindings, store_ids, values, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(bindings, ProgramBindings);
        if (bindings.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ptr1 = passArrayJsValueToWasm0(store_ids, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(values, NadaValues);
        if (values.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_compute(this.__wbg_ptr, ptr0, len0, bindings.__wbg_ptr, ptr1, len1, values.__wbg_ptr, receipt.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Fetch the result of the compute in the Nillion Network
    *
    * @param {string} result_id - The computation UUID returned after calling `compute`
    * @return {Promise<Object>} - The result of the computation
    *
    * @example
    * const result = await nillionClient.compute_result(result_id);
    */
    compute_result(result_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(result_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nillionclient_compute_result(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Retrieve permissions for a group of values stored in the Nillion network.
    *
    * @param {string} cluster_id - The identifier of the target cluster
    * @param {string} store_id - The store value identifier for the values collection where the values are
    * @return {Promise<Permissions>} The permissions associated to the values
    *
    * @example
    * const permissions = await nillionClient.retrieve_permissions(cluster_id, store_id);
    */
    retrieve_permissions(cluster_id, store_id, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(store_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_retrieve_permissions(this.__wbg_ptr, ptr0, len0, ptr1, len1, receipt.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Update permissions for a group of values stored in the Nillion network.
    *
    * @param {string} cluster_id - The identifier of the target cluster
    * @param {string} store_id - The store value identifier for the values collection where the values are
    * @param {Permissions} permissions - The permissions that will replace the existing permissions for the values
    * @return {Promise<string>} The action ID corresponding to the update operation
    *
    * @example
    * const permissions = Permissions.default_for_user(nillionClient.user_id);
    * permissions.add_update_permissions(["user_id"]);
    * const action_id = await nillionClient.update_permissions(cluster_id, store_id, permissions);
    */
    update_permissions(cluster_id, store_id, permissions, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(store_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(permissions, Permissions);
        if (permissions.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_update_permissions(this.__wbg_ptr, ptr0, len0, ptr1, len1, permissions.__wbg_ptr, receipt.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Store a program in the Nillion Network
    *
    * @param {string} cluster_id - UUID of the targeted preprocessing cluster
    * @param {string} program_name - The name of the program
    * @param {UInt8Array} program - The compiled nada program in binary format
    * @return The program ID associated with the program
    *
    * @example
    * const program_id = await nillionClient.store_program(cluster_id, 'program_name', program);
    */
    store_program(cluster_id, program_name, program, receipt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(program_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        _assertClass(receipt, PaymentReceipt);
        if (receipt.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_store_program(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, receipt.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Request a price quote for an operation on the network.
    *
    * This method asks the network to calculate a price quote for the specified operation. Payment
    * and submission of the operation is the client's responsibility and must be done before the
    * quote expires.
    *
    * @param {string} cluster_id - UUID of the targeted preprocessing cluster
    * @param {string} operation - The operation to get a quote for.
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
    request_price_quote(cluster_id, operation) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(operation, Operation);
        if (operation.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.nillionclient_request_price_quote(this.__wbg_ptr, ptr0, len0, operation.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Returns information about a Nillion cluster
    *
    * @param {string} cluster_id - Identifier of the target cluster
    * @return {Promise<ClusterDescriptor>} The cluster descriptor for the given cluster
    *
    * @example
    * const cluster_descriptor = await nillionClient.cluster_information(cluster_id);
    */
    cluster_information(cluster_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(cluster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nillionclient_cluster_information(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Enables tracking for the user.
    *
    * Enables tracking of client actions (store, retrieve, compute ...)
    * @return {Promise}
    *
    * @example
    * await nillionClient.enable_tracking();
    */
    static enable_tracking(wallet_addr) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(wallet_addr) ? 0 : passStringToWasm0(wallet_addr, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.nillionclient_enable_tracking(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the build version of the Nillion client.
    *
    * @return {string} A string representation of the build version
    *
    * @example
    * const version = nillionClient.build_version;
    */
    static get build_version() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nillionclient_build_version(retptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const NodeKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nodekey_free(ptr >>> 0));
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

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NodeKey.prototype);
        obj.__wbg_ptr = ptr;
        NodeKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NodeKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nodekey_free(ptr);
    }
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
    static from_seed(seed) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nodekey_from_seed(ptr0, len0);
        return NodeKey.__wrap(ret);
    }
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
    static from_base58(contents) {
        const ptr0 = passStringToWasm0(contents, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nodekey_from_base58(ptr0, len0);
        return NodeKey.__wrap(ret);
    }
}

const OperationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_operation_free(ptr >>> 0));
/**
* Operation.
*
* This type represents an operation to be run on the Nillion network.
*
* @hideconstructor
*/
export class Operation {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Operation.prototype);
        obj.__wbg_ptr = ptr;
        OperationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OperationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_operation_free(ptr);
    }
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
    static store_values(values, ttl_days) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(values, NadaValues);
            if (values.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            _assertNum(ttl_days);
            wasm.operation_store_values(retptr, values.__wbg_ptr, ttl_days);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Operation.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    static update_values(values, ttl_days) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(values, NadaValues);
            if (values.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            _assertNum(ttl_days);
            wasm.operation_update_values(retptr, values.__wbg_ptr, ttl_days);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Operation.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    static compute(program_id, values) {
        const ptr0 = passStringToWasm0(program_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(values, NadaValues);
        if (values.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.operation_compute(ptr0, len0, values.__wbg_ptr);
        return Operation.__wrap(ret);
    }
    /**
    * Create a new retrieve value operation.
    *
    * @return {Operation} - The constructed operation.
    *
    * @example
    * const operation = Operation.retrieve_value();
    * @returns {Operation}
    */
    static retrieve_value() {
        const ret = wasm.operation_retrieve_value();
        return Operation.__wrap(ret);
    }
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
    static store_program(program) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.operation_store_program(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Operation.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a new retrieve permissions operation.
    *
    * @return {Operation} - The constructed operation.
    *
    * @example
    * const operation = Operation.retrieve_permissions();
    * @returns {Operation}
    */
    static retrieve_permissions() {
        const ret = wasm.operation_retrieve_permissions();
        return Operation.__wrap(ret);
    }
    /**
    * Create a new update permissions operation.
    *
    * @return {Operation} - The constructed operation.
    *
    * @example
    * const operation = Operation.update_permissions();
    * @returns {Operation}
    */
    static update_permissions() {
        const ret = wasm.operation_update_permissions();
        return Operation.__wrap(ret);
    }
}

const OperationCostFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_operationcost_free(ptr >>> 0));
/**
*/
export class OperationCost {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(OperationCost.prototype);
        obj.__wbg_ptr = ptr;
        OperationCostFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            base_fee: this.base_fee,
            congestion_fee: this.congestion_fee,
            storage_fee: this.storage_fee,
            preprocessing_fee: this.preprocessing_fee,
            compute_fee: this.compute_fee,
            total: this.total,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OperationCostFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_operationcost_free(ptr);
    }
    /**
    * Gets the cost of the base fee in unil units.
    *
    * @return {string} - The base fee for this quote.
    *
    * @example
    *     const base_fee = cost.base_fee
    */
    get base_fee() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.operationcost_base_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Gets the cost of the congestion fee in unil units.
    *
    * @return {string} - The congestion fee for this quote.
    *
    * @example
    *     const congestion_fee = cost.congestion_fee
    */
    get congestion_fee() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.operationcost_congestion_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Gets the cost of the storage fee in unil units.
    *
    * @return {string} - The storage fee for this quote.
    *
    * @example
    *     const storage_fee = cost.storage_fee
    */
    get storage_fee() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.operationcost_storage_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Gets the cost of the preprocessing fee in unil units.
    *
    * @return {string} - The preprocessing fee for this quote.
    *
    * @example
    *     const preprocessing_fee = cost.preprocessing_fee
    */
    get preprocessing_fee() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.operationcost_preprocessing_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * Gets the cost of the compute fee in unil units.
    *
    * @return {string} - The compute fee for this quote.
    *
    * @example
    *     const compute_fee = cost.compute_fee
    */
    get compute_fee() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.operationcost_compute_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
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
    get total() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.operationcost_total(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PaymentReceiptFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_paymentreceipt_free(ptr >>> 0));
/**
* Payment receipt.
*
* This type represents a payment receipt for an operation in the Nillion network.
*
* @hideconstructor
*/
export class PaymentReceipt {

    toJSON() {
        return {
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PaymentReceiptFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_paymentreceipt_free(ptr);
    }
    /**
    * Creates an instance of a payment receipt
    *
    * @param {PriceQuote} quote - The price quote this receipt is for
    * @param {string} transaction_hash - The hash of the transaction in which the payment was
    * made.
    */
    constructor(quote, transaction_hash) {
        _assertClass(quote, PriceQuote);
        if (quote.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ptr0 = passStringToWasm0(transaction_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.paymentreceipt_new(quote.__wbg_ptr, ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}

const PermissionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_permissions_free(ptr >>> 0));
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

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Permissions.prototype);
        obj.__wbg_ptr = ptr;
        PermissionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PermissionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_permissions_free(ptr);
    }
    /**
    * Build a new empty instance of Permissions
    *
    * @example
    * const permissions = new Permissions();
    */
    constructor() {
        const ret = wasm.permissions_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
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
    static default_for_user(user_id) {
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.permissions_default_for_user(ptr0, len0);
        return Permissions.__wrap(ret);
    }
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
    add_retrieve_permissions(user_ids) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passArrayJsValueToWasm0(user_ids, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.permissions_add_retrieve_permissions(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    add_update_permissions(user_ids) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passArrayJsValueToWasm0(user_ids, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.permissions_add_update_permissions(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    add_delete_permissions(user_ids) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passArrayJsValueToWasm0(user_ids, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.permissions_add_delete_permissions(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    add_compute_permissions(permissions) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.permissions_add_compute_permissions(retptr, this.__wbg_ptr, addHeapObject(permissions));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    is_retrieve_allowed(user_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.permissions_is_retrieve_allowed(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
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
    is_update_allowed(user_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.permissions_is_update_allowed(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
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
    is_delete_allowed(user_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.permissions_is_delete_allowed(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
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
    is_compute_allowed(user_id, program) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(program, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.permissions_is_compute_allowed(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret !== 0;
    }
}

const PreprocessingProtocolConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_preprocessingprotocolconfig_free(ptr >>> 0));
/**
* The pre-processing protocol configuration
* @hideconstructor
*/
export class PreprocessingProtocolConfig {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PreprocessingProtocolConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_preprocessingprotocolconfig_free(ptr);
    }
    /**
    * The number of elements to be generated on every run.
    *
    * @example
    * const descriptor = await nillionClient.cluster_information();
    * const preprocessing = descriptor.preprocessing;
    * const lambda = preprocessing.lambda;
    * const batch_size = lambda.batch_size;
    * @returns {number}
    */
    get batch_size() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.preprocessingprotocolconfig_batch_size(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const PriceQuoteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pricequote_free(ptr >>> 0));
/**
* Price quote.
*
* This type represents a price quote for an operation in the Nillion network.
*
* @hideconstructor
*/
export class PriceQuote {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PriceQuote.prototype);
        obj.__wbg_ptr = ptr;
        PriceQuoteFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            expires_at: this.expires_at,
            cost: this.cost,
            nonce: this.nonce,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PriceQuoteFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pricequote_free(ptr);
    }
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
    get expires_at() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pricequote_expires_at(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Gets the cost for the quoted operation in unil units. The payment associated for the quoted operation must
    * transfer this amount for it to be considered a valid payment.
    *
    * @return {OperationCost} - The cost for this quote.
    *
    * @example
    * const cost = quote.cost;
    */
    get cost() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pricequote_cost(this.__wbg_ptr);
        return OperationCost.__wrap(ret);
    }
    /**
    * Gets the nonce for this quote. This nonce must be used as part of the payment transaction.
    *
    * @example
    * const nonce = quote.nonce;
    */
    get nonce() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.pricequote_nonce(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ProgramBindingsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_programbindings_free(ptr >>> 0));
/**
* Program Bindings
*/
export class ProgramBindings {

    toJSON() {
        return {
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProgramBindingsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_programbindings_free(ptr);
    }
    /**
    * Creates a new ProgramBindings
    *
    * @param {string} program_id - A program identifier, this is usually the given name of the program
    * @return {ProgramBindings} A new instance of ProgramBindings
    *
    * @example
    * const bindings = new ProgramBindings("simple_program");
    */
    constructor(program_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(program_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.programbindings_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Bind an input party with a name
    *
    * @param {string} name - Name of the input party
    * @param {string} id - Identifier of the party
    *
    * @example
    * bindings.add_input_party("Party1", "12D3KooWKbs29XBmtXZEFZwHBr39BsgbysPAmAS3RWWdtBBc7joH");
    */
    add_input_party(name, id) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.programbindings_add_input_party(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Bind an output party with a name
    *
    * @param {string} name - Name of the input party
    * @param {string} id - Identifier of the party
    *
    * @example
    * bindings.add_output_party("Party2", "12D3KooWKbs29XBmtXZEFZwHBr39BsgbysPAmAS3RWWdtBBc7joH");
    */
    add_output_party(name, id) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.programbindings_add_output_party(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const UserKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userkey_free(ptr >>> 0));
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

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UserKey.prototype);
        obj.__wbg_ptr = ptr;
        UserKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userkey_free(ptr);
    }
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
    static generate() {
        const ret = wasm.userkey_generate();
        return UserKey.__wrap(ret);
    }
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
    static from_seed(seed) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.userkey_from_seed(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UserKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    public_key() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.userkey_public_key(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
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
    static from_base58(contents) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(contents, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.userkey_from_base58(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UserKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the key in Base58 encoded form.
    *
    * @return {string} the key encoded as a Base58 string
    * @example
    *
    * const key = new UserKey.from_seed("my_seed");
    * const base58_key = key.to_base58();
    */
    to_base58() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.userkey_to_base58(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_str = function(arg0, arg1) {
        const ret = BigInt(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +getObject(arg0);
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_pricequote_new = function() { return logError(function (arg0) {
        const ret = PriceQuote.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_permissions_new = function() { return logError(function (arg0) {
        const ret = Permissions.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clusterdescriptor_new = function() { return logError(function (arg0) {
        const ret = ClusterDescriptor.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_nadavalue_new = function() { return logError(function (arg0) {
        const ret = NadaValue.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        if (!isLikeNone(ret)) {
            _assertNum(ret);
        }
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        _assertNum(ret);
        return ret;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_String_b9412f8799faab3e = function() { return logError(function (arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function() { return logError(function (arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() { return logError(function () {
        const ret = new Error();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = getObject(arg0) === null;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_dial_30e8812bd98d8882 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).dial(getStringFromWasm0(arg1, arg2), arg3 !== 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_listenon_ff60af88e263af6b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).listen_on(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_read_c68b57fe8b00a7b9 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).read;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_write_3d1f2c679934dd25 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).write(getArrayU8FromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_shutdown_a85687f76230bdad = function() { return handleError(function (arg0) {
        getObject(arg0).shutdown();
    }, arguments) };
    imports.wbg.__wbg_close_6a852f1689b0b8e2 = function() { return logError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_newaddrs_71100193fa47c194 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).new_addrs;
        var ptr1 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_expiredaddrs_c5a2f22f3c1b584f = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).expired_addrs;
        var ptr1 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_newconnections_44d312e897866295 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).new_connections;
        var ptr1 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_connection_632aa60cbc9cffe2 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).connection;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_observedaddr_1ca1352afe737cc2 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).observed_addr;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_localaddr_91f6c1af88a435e2 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).local_addr;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_websockettransport_84c8ba3f0c468e40 = function() { return logError(function () {
        const ret = websocket_transport();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_fetch_bc7c8e27076a5c84 = function() { return logError(function (arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_crypto_1d1f22824a6a080c = function() { return logError(function (arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_require_cca90b1a94a0255b = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_process_4a72847cc503995b = function() { return logError(function (arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_versions_f686565e586dd935 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_76877dbc010e786d = function() { return logError(function (arg0) {
        const ret = clearTimeout(takeObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_static_accessor_URL_1a7ae0d56f4d6839 = function() { return logError(function () {
        const ret = import.meta.url;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_startWorker_999d186cbabd739c = function() { return logError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = startWorker(takeObject(arg0), takeObject(arg1), takeObject(arg2), takeObject(arg3), LoaderHelper.__wrap(arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_waitAsync_46d5c36955b71a79 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = Atomics.waitAsync(getObject(arg0), arg1, arg2);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_waitAsync_5d743fc9058ba01a = function() { return logError(function () {
        const ret = Atomics.waitAsync;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_async_19c0400d97cc72fe = function() { return logError(function (arg0) {
        const ret = getObject(arg0).async;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_value_571d60108110e917 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_481971b0d87f3dd4 = function() { return logError(function (arg0) {
        queueMicrotask(getObject(arg0));
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_3cbae2ec6b6cd3d6 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_link_fc1eedd35dc7e0a6 = function() { return logError(function (arg0) {
        const ret = "data:application/javascript," + encodeURIComponent(`onmessage = function (ev) {
            let [ia, index, value] = ev.data;
            ia = new Int32Array(ia.buffer);
            let result = Atomics.wait(ia, index, value);
            postMessage(result);
        };
        `);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_f401953a2cf86220 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_localStorage_e381d34d0c40c761 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).localStorage;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_error_8e3928cfb8a43e2b = function() { return logError(function (arg0) {
        console.error(getObject(arg0));
    }, arguments) };
    imports.wbg.__wbg_fetch_921fad6ef9e883dd = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_ab6fd82b10560829 = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_7bfcb4937d1d5e29 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_getItem_164e8e5265095b87 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_setItem_ba2bb41d73dac079 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_signal_a61f78a3478fd9bc = function() { return logError(function (arg0) {
        const ret = getObject(arg0).signal;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_0d76b0581eca6298 = function() { return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_abort_2aa7521d5690750e = function() { return logError(function (arg0) {
        getObject(arg0).abort();
    }, arguments) };
    imports.wbg.__wbg_addEventListener_53b787075bd5e003 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_addEventListener_4283b15b4f039eb5 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbg_dispatchEvent_63c0c01600a98fd2 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).dispatchEvent(getObject(arg1));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_removeEventListener_92cb9b3943463338 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_data_3ce7c145ca4fbcdc = function() { return logError(function (arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Response_849eb93e75734b6e = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_url_5f6dc4009ac5f99d = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_status_61a01141acd3cf74 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).status;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_9620bfada380764a = function() { return logError(function (arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_text_450a059667fd91fd = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_name_c1b921b610dd2f64 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).name;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_close_e37e2399b189a4cd = function() { return logError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_readyState_1c157e4ea17c134a = function() { return logError(function (arg0) {
        const ret = getObject(arg0).readyState;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setbinaryType_b0cf5103cd561959 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_new_6c74223c77cfabad = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_acd9532ff5c093ea = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_send_70603dff16b81b66 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_send_5fcd7bab9777194e = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_wasClean_8222e9acf5c5ad07 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).wasClean;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_code_5ee5dcc2842228cd = function() { return logError(function (arg0) {
        const ret = getObject(arg0).code;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_reason_5ed6709323849cb1 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).reason;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_newwitheventinitdict_c939a6b964db4d91 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new CloseEvent(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_now_4e659b3d15f470d9 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).now();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_newwithstrandinit_3fd6fba4083ff2d0 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonmessage_503809e5bb51bd33 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_new_d1187ae36d662ef9 = function() { return handleError(function (arg0, arg1) {
        const ret = new Worker(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_postMessage_7380d10e8b8269df = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).postMessage(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_new_16b304a2cfa7ff4a = function() { return logError(function () {
        const ret = new Array();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithlength_66ae46612e7f0234 = function() { return logError(function (arg0) {
        const ret = new Array(arg0 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_bd8e338fbd5f5cc8 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_d4638f722068f043 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    }, arguments) };
    imports.wbg.__wbg_isArray_2ab64d95e09ea0ae = function() { return logError(function (arg0) {
        const ret = Array.isArray(getObject(arg0));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_length_cd7af8117672b8b8 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).length;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_of_6a70eed8d41f469c = function() { return logError(function (arg0, arg1, arg2) {
        const ret = Array.of(getObject(arg0), getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_ArrayBuffer_836825be07d4c9d2 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_Error_e20bb56fd5591a93 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_message_5bf28016c2b49cfb = function() { return logError(function (arg0) {
        const ret = getObject(arg0).message;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_name_e7429f0dda6079e2 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).name;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_toString_ffe4c9ea3b3532e9 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function() { return logError(function (arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_27c0f87801dedf93 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_d9bc3a0147634640 = function() { return logError(function () {
        const ret = new Map();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_8417257aaedc936b = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_196c84450b364254 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_40fc327bfc8770e6 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_298b57d23c0fc80c = function() { return logError(function (arg0) {
        const ret = getObject(arg0).done;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_value_d93c65011f51a456 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getTime_2bc4375165f02d15 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_cf3ec55744a78578 = function() { return logError(function (arg0) {
        const ret = new Date(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new0_7d84e5b2cd9fdc73 = function() { return logError(function () {
        const ret = new Date();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Object_71ca3c0a59266746 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Object;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_entries_95cc2c823b285a09 = function() { return logError(function (arg0) {
        const ret = Object.entries(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_fromEntries_c9d8ec8925e677a8 = function() { return handleError(function (arg0) {
        const ret = Object.fromEntries(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_72fb9a18b5ae2624 = function() { return logError(function () {
        const ret = new Object();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_toString_c816a20ab859d0c1 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_iterator_2cee6dadfd956dfa = function() { return logError(function () {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_81740750da40724f = function() { return logError(function (arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_353(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    }, arguments) };
    imports.wbg.__wbg_resolve_b0083a7967828ec8 = function() { return logError(function (arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_0c86a60e8fcfe9f6 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_a73caa9a87991566 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_c6fb939a7f436783 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_207b558942527489 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_8cccba86b0f574cb = function() { return logError(function (arg0) {
        const ret = new Int32Array(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_63b92bc8671ed464 = function() { return logError(function (arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithlength_e9b4878cebadb3d3 = function() { return logError(function (arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function() { return logError(function (arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_subarray_a1f73cd4b5b42fe1 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_c20a40f15020d68a = function() { return logError(function (arg0) {
        const ret = getObject(arg0).length;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_a47bac70306a19a7 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_stringify_8887fe74e1c50d81 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_e3c254076557e348 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_has_0af94d20077affa2 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_1f9b04f170055d33 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_buffer_12d079cc21e14bdb = function() { return logError(function (arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_module = function() {
        const ret = __wbg_init.__wbindgen_wasm_module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper5588 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 701, __wbg_adapter_46);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper5590 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 699, __wbg_adapter_49);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper5592 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 703, __wbg_adapter_52);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper116676 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 8274, __wbg_adapter_55);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper117942 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 8320, __wbg_adapter_58);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper117944 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 8318, __wbg_adapter_61);
        return addHeapObject(ret);
    }, arguments) };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {
    imports.wbg.memory = maybe_memory || new WebAssembly.Memory({initial:38,maximum:16384,shared:true});
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module, maybe_memory) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports, maybe_memory);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input, maybe_memory) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('index_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports, maybe_memory);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
