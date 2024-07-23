# Commnad format: TARGET-VERB-FLAGS.
# If no TARGET specified then 'all' targets are included

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
    npx eslint -c eslint.config.mjs
    npx tsc

check-and-fix:
    #!/usr/bin/env bash
    set -e
    npx prettier --write -c "packages/**/*.(js|jsx|ts|tsx)"
    npx eslint --fix -c eslint.config.mjs
    npx tsc

pack:
    #!/usr/bin/env bash
    set -e
    just clean
    just wasm-pack
    just core-pack
    just payments-pack
    just client-pack

unpublish:
    #!/usr/bin/env bash
    set -e
    echo "warning: only for local development"
    npm unpublish --force @nillion/wasm
    npm unpublish --force @nillion/client-core
    npm unpublish --force @nillion/client-payments
    npm unpublish --force @nillion/client-vms
    npm unpublish --force @nillion/client-react-hooks

publish:
    #!/usr/bin/env bash
    set -e
    just clean
    just check
    just wasm-publish
    just client-core-publish
    just client-payments-publish
    just client-vms-publish
    just client-react-hooks-publish
# <<< End all <<<


# >>> Start @nillion/wasm >>>
wasm-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/wasm pack --pack-destination dist

wasm-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/wasm publish
# <<< End @nillion/wasm <<<


# >>> Start @nillion/client-core >>>
client-core-test:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npx concurrently -c "auto" \
    "npm -w packages/client-core run test.build" \
    "npm -w packages/client-core run test"

client-core-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npm -w packages/client-core run build
    npm -w packages/client-core pack --pack-destination dist

client-core-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-core run clean
    npm -w packages/client-core run build
    npm -w packages/client-core publish
# <<< End @nillion/client-core <<<


# >>> Start @nillion/client-payments >>>
client-payments-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npm -w packages/client-payments run build.proto
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build.watch" \
      "npm -w packages/client-payments run test.build" \
      "npm -w packages/client-payments run test"

client-payments-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-payments run clean
    npm -w packages/client-payments run build
    npm -w packages/client-payments pack --pack-destination dist

client-payments-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-payments run clean
    npm -w packages/client-payments run build
    npm -w packages/client-payments publish
# <<< End @nillion/client-payments <<<


# >>> Start @nillion/client-vms >>>
client-vms-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build.watch" \
      "npm -w packages/client-payments run build.watch" \
      "npm -w packages/client-vms run test.build" \
      "npm -w packages/client-vms run test"

client-vms-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-vms run clean
    npm -w packages/client-vms run build
    npm -w packages/client-vms pack --pack-destination dist

client-vms-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-vms run clean
    npm -w packages/client-vms run build
    npm -w packages/client-vms publish
# <<< End @nillion/client-vms <<<


# >>> Start @nillion/client-react-hooks >>>
client-react-hooks-dev:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build.watch" \
      "npm -w packages/client-payments run build.watch" \
      "npm -w packages/client-vms run build.watch" \
      "npm -w packages/client-react-hooks run start"

client-react-hooks-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-react-hooks run clean
    npm -w packages/client-react-hooks run build
    npm -w packages/client-react-hooks pack --pack-destination dist

client-react-hooks-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client-react-hooks run clean
    npm -w packages/client-react-hooks run build
    npm -w packages/client-react-hooks publish
# <<< End @nillion/client-react-hooks <<<


# >>> Start @nillion/examples-react >>>
examples-react-start:
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
