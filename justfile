# >>> Start all >>>
clean:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npm -w packages/client-payments run clean
    npm -w packages/client-vms run clean
    npm -w packages/client-react-hooks run clean

check:
    #!/usr/bin/env bash
    set -e
    npx prettier -c "packages/**/*.(js|jsx|ts|tsx)"

    echo "Running eslint... "
    npx eslint -c eslint.config.mjs
    echo "done."

    echo "Running tsc... "
    npx tsc
    echo "done."

pack:
    #!/usr/bin/env bash
    set -e
    just clean
    just wasm-pack
    just client-core-pack
    just client-payments-pack
    just client-vms-pack
    just client-react-hooks-pack

unpublish:
    #!/usr/bin/env bash
    set -e
    echo "warning: only for local development"
    npm unpublish --force @nillion/client-wasm
    npm unpublish --force @nillion/client-core
    npm unpublish --force @nillion/client-payments
    npm unpublish --force @nillion/client-vms
    npm unpublish --force @nillion/client-react-hooks

publish:
    #!/usr/bin/env bash
    set -e
    just clean
    just check
    just publish-client-wasm
    just publish-client-core
    just publish-client-payments
    just publish-client-vms
    just publish-client-react-hooks
# <<< End all <<<


# >>> Start @nillion/client-wasm >>>
pack-client-wasm:
    #!/usr/bin/env bash
    set -e
    npm -w packages/wasm pack --pack-destination dist

publish-client-wasm:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-wasm publish --tag next
# <<< End @nillion/client-wasm <<<


# >>> Start @nillion/client-core >>>
test-client-core:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npx concurrently -c "auto" \
    "npm -w packages/client-core run test.build" \
    "npm -w packages/client-core run test"

pack-client-core:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npm -w packages/client-core run build
    npm -w packages/client-core pack --pack-destination dist

publish-client-core:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npm -w packages/client-core run build
    npm -w packages/client-core publish
# <<< End @nillion/client-core <<<


# >>> Start @nillion/client-payments >>>
test-client-payments:
    #!/usr/bin/env bash
    set -e
    just clean
    npm -w packages/client-payments run build.proto
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build.watch" \
      "npm -w packages/client-payments run test.build" \
      "npm -w packages/client-payments run test"

pack-client-payments:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-payments run clean
    npm -w packages/client-payments run build
    npm -w packages/client-payments pack --pack-destination dist

publish-client-payments:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-payments run clean
    npm -w packages/client-payments run build
    npm -w packages/client-payments publish
# <<< End @nillion/client-payments <<<


# >>> Start @nillion/client-vms >>>
test-client-vms:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build.watch" \
      "npm -w packages/client-payments run build.watch" \
      "npm -w packages/client-vms run test.build" \
      "npm -w packages/client-vms run test"

pack-client-vms:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-vms run clean
    npm -w packages/client-vms run build
    npm -w packages/client-vms pack --pack-destination dist

publish-client-vms:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-vms run clean
    npm -w packages/client-vms run build
    npm -w packages/client-vms publish
# <<< End @nillion/client-vms <<<


# >>> Start @nillion/client-react-hooks >>>
pack-client-react-hooks:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-react-hooks run clean
    npm -w packages/client-react-hooks run build
    npm -w packages/client-react-hooks pack --pack-destination dist

publish-client-react-hooks:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-react-hooks run clean
    npm -w packages/client-react-hooks run build
    npm -w packages/client-react-hooks publish
# <<< End @nillion/client-react-hooks <<<


# >>> Start @nillion/examples-react >>>
dev-examples-react:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build.watch" \
      "npm -w packages/client-payments run build.watch" \
      "npm -w packages/client-vms run build.watch" \
      "npm -w packages/client-react-hooks run build.watch" \
      "npm -w examples/react run start"
# <<< End @nillion/examples-react <<<
