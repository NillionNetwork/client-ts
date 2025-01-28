let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

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
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
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

function isLikeNone(x) {
    return x === undefined || x === null;
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
    if (builtInMatches && builtInMatches.length > 1) {
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

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}

const EcdsaSignatureFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ecdsasignature_free(ptr >>> 0, 1));
/**
 * A ecdsa signature
 */
export class EcdsaSignature {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(EcdsaSignature.prototype);
        obj.__wbg_ptr = ptr;
        EcdsaSignatureFinalization.register(obj, obj.__wbg_ptr, obj);
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
        EcdsaSignatureFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ecdsasignature_free(ptr, 0);
    }
    /**
     * Construct a new instance the components.
     * @param {Uint8Array} r
     * @param {Uint8Array} s
     */
    constructor(r, s) {
        const ptr0 = passArray8ToWasm0(r, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(s, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.ecdsasignature_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        EcdsaSignatureFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Access r component of the signature
     * @returns {Uint8Array}
     */
    r() {
        const ret = wasm.ecdsasignature_r(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Access s component of the signature
     * @returns {Uint8Array}
     */
    s() {
        const ret = wasm.ecdsasignature_s(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const EncodedModuloFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_encodedmodulo_free(ptr >>> 0, 1));

export class EncodedModulo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(EncodedModulo.prototype);
        obj.__wbg_ptr = ptr;
        EncodedModuloFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EncodedModuloFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_encodedmodulo_free(ptr, 0);
    }
}

const EncryptedNadaValuesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_encryptednadavalues_free(ptr >>> 0, 1));
/**
 * A set of encrypted nada values.
 */
export class EncryptedNadaValues {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(EncryptedNadaValues.prototype);
        obj.__wbg_ptr = ptr;
        EncryptedNadaValuesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EncryptedNadaValuesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_encryptednadavalues_free(ptr, 0);
    }
    /**
     * Convert EncryptedNadaValues into a JS object
     * @returns {any}
     */
    to_js_object() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.encryptednadavalues_to_js_object(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Convert a JS object into a EncryptedNadaValues
     * @param {any} js_object
     * @param {EncodedModulo} modulo
     * @returns {EncryptedNadaValues}
     */
    static from_js_object(js_object, modulo) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(modulo, EncodedModulo);
            var ptr0 = modulo.__destroy_into_raw();
            wasm.encryptednadavalues_from_js_object(retptr, addBorrowedObject(js_object), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EncryptedNadaValues.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
}

const NadaValueFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nadavalue_free(ptr >>> 0, 1));
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
        wasm.__wbg_nadavalue_free(ptr, 0);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new secret boolean value.
     *
     * @param {string} value - The value must be a valid string representation of boolean.
     * @return {NadaValue} The encoded secret corresponding to the value provided
     *
     * @example
     * const value = NadaValue.new_secret_boolean(true);
     */
    static new_secret_boolean(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalue_new_secret_boolean(retptr, value);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new public boolean value.
     *
     * @param {string} value - The value must be a valid string representation of boolean.
     * @return {NadaValue} The encoded secret corresponding to the value provided
     *
     * @example
     * const value = NadaValue.new_public_boolean(true);
     */
    static new_public_boolean(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalue_new_public_boolean(retptr, value);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new ecdsa private key
     *
     * @param {Uint8Array} value - The ecdsa private key in binary (byte array) encoded format
     * @return {NadaValue} The encoded secret corresponding to the value provided
     *
     * @example
     * const value = NadaValue.new_ecdsa_private_key([1,0,1,222,21,...]);
     */
    static new_ecdsa_private_key(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(value, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_ecdsa_private_key(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new ecdsa digest message.
     *
     * @param {Uint8Array} value - The ecdsa digest message in binary (byte array) encoded format
     * @return {NadaValue} The encoded secret corresponding to the value provided
     *
     * @example
     * const value = NadaValue.new_ecdsa_digest_message([1,0,1,222,21,...]);
     */
    static new_ecdsa_digest_message(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(value, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_ecdsa_digest_message(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValue.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new ecdsa signature.
     *
     * @param {Uint8Array} r - The r component of the signature in binary (byte array) encoded format
     * @param {Uint8Array} s - The s component of the signature in binary (byte array) encoded format
     * @return {NadaValue} The encoded secret corresponding to the value provided
     *
     * @example
     * const value = NadaValue::new_ecdsa_signature(EcdsaSignature { r, s });
     */
    static new_ecdsa_signature(r, s) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(r, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(s, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.nadavalue_new_ecdsa_signature(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalue_to_byte_array(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
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
     * Convert this NadaValue into an EcdsaSignature.
     *
     * This is only valid for EcdsaSignature.
     * @return {Uint8Array} the byte array contained in this value.
     * @throws {Error} if the value is not a secret blob.
     *
     * @example
     * const value = NadaValue.new_ecdsa_signature([1,0,1,222,21], [1,0,1,222,21]);
     * const signature = value.to_ecdsa_signature();
     */
    to_ecdsa_signature() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalue_to_ecdsa_signature(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return EcdsaSignature.__wrap(r0);
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
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalue_to_integer(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
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
     * Return the Nada type represented by this instance.
     *
     * @example
     * const value = NadaValue.new_secret_integer("42");
     * console.log(value.type()); // "SecretInteger"
     */
    type_name() {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalue_type_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
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
    : new FinalizationRegistry(ptr => wasm.__wbg_nadavalues_free(ptr >>> 0, 1));
/**
 * A collection of named values.
 */
export class NadaValues {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NadaValues.prototype);
        obj.__wbg_ptr = ptr;
        NadaValuesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

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
        wasm.__wbg_nadavalues_free(ptr, 0);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            NadaValuesFinalization.register(this, this.__wbg_ptr, this);
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
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(input, NadaValue);
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
        const ret = wasm.nadavalues_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Convert NadaValues into a JS object
     *
     * @example
     * const nadaValues = new NadaValues();
     * nadaValues.insert("foo", NadaValue::new_secret_integer("42"));
     * const values = nadaValues.to_record();
     * console.log(values); // { foo: { type: "SecretInteger", value: "42" } }
     * @returns {any}
     */
    to_record() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nadavalues_to_record(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const NadaValuesClassificationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nadavaluesclassification_free(ptr >>> 0, 1));
/**
 * The classification of a set of nada values.
 */
export class NadaValuesClassification {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NadaValuesClassification.prototype);
        obj.__wbg_ptr = ptr;
        NadaValuesClassificationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NadaValuesClassificationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nadavaluesclassification_free(ptr, 0);
    }
    /**
     * The number of shares
     * @returns {bigint}
     */
    get shares() {
        const ret = wasm.__wbg_get_nadavaluesclassification_shares(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The number of shares
     * @param {bigint} arg0
     */
    set shares(arg0) {
        wasm.__wbg_set_nadavaluesclassification_shares(this.__wbg_ptr, arg0);
    }
    /**
     * The number of public values
     * @returns {bigint}
     */
    get public() {
        const ret = wasm.__wbg_get_nadavaluesclassification_public(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The number of public values
     * @param {bigint} arg0
     */
    set public(arg0) {
        wasm.__wbg_set_nadavaluesclassification_public(this.__wbg_ptr, arg0);
    }
    /**
     * The number of ecdsa key shares
     * @returns {bigint}
     */
    get ecdsa_private_key_shares() {
        const ret = wasm.__wbg_get_nadavaluesclassification_ecdsa_private_key_shares(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The number of ecdsa key shares
     * @param {bigint} arg0
     */
    set ecdsa_private_key_shares(arg0) {
        wasm.__wbg_set_nadavaluesclassification_ecdsa_private_key_shares(this.__wbg_ptr, arg0);
    }
    /**
     * The number of ecdsa signatures shares
     * @returns {bigint}
     */
    get ecdsa_signature_shares() {
        const ret = wasm.__wbg_get_nadavaluesclassification_ecdsa_signature_shares(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The number of ecdsa signatures shares
     * @param {bigint} arg0
     */
    set ecdsa_signature_shares(arg0) {
        wasm.__wbg_set_nadavaluesclassification_ecdsa_signature_shares(this.__wbg_ptr, arg0);
    }
}

const PartyIdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_partyid_free(ptr >>> 0, 1));
/**
 * A party identifier.
 */
export class PartyId {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PartyId.prototype);
        obj.__wbg_ptr = ptr;
        PartyIdFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof PartyId)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
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
        PartyIdFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_partyid_free(ptr, 0);
    }
    /**
     * Construct a new instance using the given identifier.
     * @param {Uint8Array} id
     */
    constructor(id) {
        const ptr0 = passArray8ToWasm0(id, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.partyid_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        PartyIdFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Access party id's underlying bytes.
     * @returns {Uint8Array}
     */
    to_byte_array() {
        const ret = wasm.partyid_to_byte_array(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const PartySharesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_partyshares_free(ptr >>> 0, 1));
/**
 * The shares for a party.
 */
export class PartyShares {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PartyShares.prototype);
        obj.__wbg_ptr = ptr;
        PartySharesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof PartyShares)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PartySharesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_partyshares_free(ptr, 0);
    }
    /**
     * Construct a PartyShares instance with the values provided.
     * @param {PartyId} party
     * @param {EncryptedNadaValues} shares
     */
    constructor(party, shares) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(party, PartyId);
            var ptr0 = party.__destroy_into_raw();
            _assertClass(shares, EncryptedNadaValues);
            var ptr1 = shares.__destroy_into_raw();
            wasm.partyshares_new(retptr, ptr0, ptr1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            PartySharesFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the party this shares are for.
     * @returns {PartyId}
     */
    get party() {
        const ret = wasm.partyshares_party(this.__wbg_ptr);
        return PartyId.__wrap(ret);
    }
    /**
     * Get the shares.
     * @returns {EncryptedNadaValues}
     */
    get shares() {
        const ret = wasm.partyshares_shares(this.__wbg_ptr);
        return EncryptedNadaValues.__wrap(ret);
    }
}

const ProgramMetadataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_programmetadata_free(ptr >>> 0, 1));
/**
 * The metadata for a nada program.
 */
export class ProgramMetadata {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProgramMetadataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_programmetadata_free(ptr, 0);
    }
    /**
     * Construct a program metadata out of a serialized program.
     * @param {Uint8Array} program
     */
    constructor(program) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.programmetadata_new(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            ProgramMetadataFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The program memory size.
     * @returns {bigint}
     */
    memory_size() {
        const ret = wasm.programmetadata_memory_size(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The total number of instructions.
     * @returns {bigint}
     */
    total_instructions() {
        const ret = wasm.programmetadata_total_instructions(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The program instructions.
     * @returns {any}
     */
    instructions() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.programmetadata_instructions(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * The program preprocessing requirements.
     * @returns {any}
     */
    preprocessing_requirements() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.programmetadata_preprocessing_requirements(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const SecretMaskerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_secretmasker_free(ptr >>> 0, 1));
/**
 * A secret masker.
 *
 * This allows masking and unmasking secrets.
 */
export class SecretMasker {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SecretMasker.prototype);
        obj.__wbg_ptr = ptr;
        SecretMaskerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SecretMaskerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secretmasker_free(ptr, 0);
    }
    /**
     * Construct a new masker that uses a 64 bit safe prime under the hood.
     * @param {bigint} polynomial_degree
     * @param {PartyId[]} parties
     * @returns {SecretMasker}
     */
    static new_64_bit_safe_prime(polynomial_degree, parties) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(parties, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secretmasker_new_64_bit_safe_prime(retptr, polynomial_degree, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return SecretMasker.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Construct a new masker that uses a 128 bit safe prime under the hood.
     * @param {bigint} polynomial_degree
     * @param {PartyId[]} parties
     * @returns {SecretMasker}
     */
    static new_128_bit_safe_prime(polynomial_degree, parties) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(parties, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secretmasker_new_128_bit_safe_prime(retptr, polynomial_degree, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return SecretMasker.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Construct a new masker that uses a 256 bit safe prime under the hood.
     * @param {bigint} polynomial_degree
     * @param {PartyId[]} parties
     * @returns {SecretMasker}
     */
    static new_256_bit_safe_prime(polynomial_degree, parties) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(parties, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secretmasker_new_256_bit_safe_prime(retptr, polynomial_degree, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return SecretMasker.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Mask a set of values.
     * @param {NadaValues} values
     * @returns {PartyShares[]}
     */
    mask(values) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(values, NadaValues);
            var ptr0 = values.__destroy_into_raw();
            wasm.secretmasker_mask(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Unmask a set of encrypted values.
     * @param {PartyShares[]} shares
     * @returns {NadaValues}
     */
    unmask(shares) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(shares, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.secretmasker_unmask(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return NadaValues.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Classify the given cleartext values.
     *
     * This allows getting the totals per value type which is a required parameter when storing values.
     * @param {NadaValues} values
     * @returns {NadaValuesClassification}
     */
    classify_values(values) {
        _assertClass(values, NadaValues);
        const ret = wasm.secretmasker_classify_values(this.__wbg_ptr, values.__wbg_ptr);
        return NadaValuesClassification.__wrap(ret);
    }
    /**
     * @returns {EncodedModulo}
     */
    modulo() {
        const ret = wasm.secretmasker_modulo(this.__wbg_ptr);
        return EncodedModulo.__wrap(ret);
    }
}

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_buffer_609cc3eee51ed158(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_call_672a4d21634d4a24() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_call_7cccdd69e0791ae2() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_crypto_ed58b8e10a292839(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_ecdsasignature_new(arg0) {
    const ret = EcdsaSignature.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_from_2a5d3e218e67aa85(arg0) {
    const ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_getRandomValues_bcb4912f16000dc4() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_get_67b2ba62fc30de12() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_b9b93047fe3cf45b(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_length_a446193dc22c12f8(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_length_e2d2a49132c1b256(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_msCrypto_0a36e2ec3a343d26(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_new_405e22f390576ce2() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_new_5e0be73521bc8c17() {
    const ret = new Map();
    return addHeapObject(ret);
};

export function __wbg_new_78feb108b6472713() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_new_a12002a7f91c75be(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_newnoargs_105ed471475aaf50(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_newwithlength_a381634e90c276d4(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_node_02999533c4ea02e3(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbg_ownKeys_3930041068756f1f() { return handleError(function (arg0) {
    const ret = Reflect.ownKeys(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_partyid_unwrap(arg0) {
    const ret = PartyId.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_partyshares_new(arg0) {
    const ret = PartyShares.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_partyshares_unwrap(arg0) {
    const ret = PartyShares.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_process_5c1d670bc53614b8(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_push_737cfc8c1432c2c6(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_randomFillSync_ab2cfe79ebbf2740() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_require_79b1e9274cde3c87() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_set_65595bdd868b3009(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_set_8fc6bf8a5b1071d1(arg0, arg1, arg2) {
    const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_set_bb8cecf6a62b9f46() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbg_static_accessor_GLOBAL_88a902d13a557d07() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_static_accessor_SELF_37c5d418e4bf5819() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_static_accessor_WINDOW_5de37043a91a9c40() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_subarray_aa9065fa9dc5df96(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_versions_c71aa1626a93e0a1(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

