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

## old

# End to End Js Client Functional Test

## Quickstart:

1. Run: `just test-js-client-jasmine-e2e`

This will:

- Build a release npm package and save it to `target/nillion-release/nillion-client-browser/npm-nillion-client-web.tgz`
- Start the functional-js cargo test which spins up a nillion devnet and funds a cosmos acccount
- Prepares the js-client-jasmine workspace
- Runs the js-jasmine test suite

## Notes and Tips

1. The test suite needs a running cluster with the configuration details available at `src/fixture/local.json` and it
   expects the Nodes fixture's programs to be present.
2. Iterate quickly by:
    - Turn off wasm-pack optimisations by editing `wasm-workspace/Cargo.toml` and set `profile.release.opt-level = 0`.
    - Point `package.json` to at the js client
      folder: `"@nillion/client-web": "file:../../../client/bindings/js-browser/"`.
    - Execute `npm run build -- --watch` in both js-browser and js-client-jasmine.
    - Rebuild the wasm component as required by
      running `cd wasm-workspace && wasm-pack build --scope nillion --target web --out-dir dist client/bindings/js-browser/nillion_client_wasm`
    - Start the test suite in interactive mode: `JASMINE_INTERACTIVE=1 cargo test -p functional-js -- --nocapture`.
    - You can now edit any of the ts files in either js-client-jasmine or js-client and they will be rebuilt on the fly.
    - View the suite in the browser and refresh it to re-run the tests.
