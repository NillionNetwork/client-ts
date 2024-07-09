# nillion-ts

An exploration into how we can deliver a better DX to the TS/JS ecosystem.

## Notes

- built/tested with npm ... please use npm
-

@nillion/nilvm-wasm
@nillion/nilvm | core?
@nillion/types (fold types into core bc everythin deps on it?)
@nillion/payments why not nilchain?
@nillion/glue
@nillion/react
@nillion/tests
@nillion/examples

## dep graph

```mermaid
graph BT
    core["@nillion/core"] --> types["@nillion/types"]
    core["@nillion/core"] --> wasm["@nillion/wasm"]
    payments["@nillion/payments"] --> core["@nillion/core"]
    payments["@nillion/payments"] --> types["@nillion/types"]
    functional_tests["@nillion/functional-tests"] --> core["@nillion/core"]
    functional_tests["@nillion/functional-tests"] --> types["@nillion/types"]
    functional_tests["@nillion/functional-tests"] --> payments["@nillion/payments"]
    react["@nillion/react"] --> core["@nillion/core"]
    react["@nillion/react"] --> types["@nillion/types"]
    react["@nillion/react"] --> payments["@nillion/payments"]
```
