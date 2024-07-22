# Commnad format: TARGET-VERB-FLAGS.
# If no TARGET specified then 'all' targets are included

# >>> Start all >>>
clean:
    #!/usr/bin/env bash
    set -e
    npm -w packages/core run clean
    npm -w packages/payments run clean
    npm -w packages/client run clean
    npm -w packages/react-hooks run clean

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
    npm unpublish --force @nillion/core
    npm unpublish --force @nillion/payments
    npm unpublish --force @nillion/client
    npm unpublish --force @nillion/react-hooks

publish:
    #!/usr/bin/env bash
    set -e
    just clean
    just check
    just wasm-publish
    just core-publish
    just payments-publish
    just client-publish
    just react-hooks-publish
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


# >>> Start @nillion/core >>>
core-test:
    #!/usr/bin/env bash
    set -e
    npm -w packages/core run clean
    npx concurrently -c "auto" \
    "npm -w packages/core run test.build" \
    "npm -w packages/core run test"

core-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/core run clean
    npm -w packages/core run build
    npm -w packages/core pack --pack-destination dist

core-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/core run clean
    npm -w packages/core run build
    npm -w packages/core publish
# <<< End @nillion/core <<<


# >>> Start @nillion/payments >>>
payments-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npm -w packages/payments run build.protobuf
    npx concurrently -c "auto" \
      "npm -w packages/core run build.watch" \
      "npm -w packages/payments run test.build" \
      "npm -w packages/payments run test"

payments-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/payments run clean
    npm -w packages/payments run build
    npm -w packages/payments pack --pack-destination dist

payments-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/payments run clean
    npm -w packages/payments run build
    npm -w packages/payments publish
# <<< End @nillion/payments <<<


# >>> Start @nillion/client >>>
client-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build.watch" \
      "npm -w packages/payments run build.watch" \
      "npm -w packages/client run build.watch" \
      "npm -w packages/client run test"

client-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client run clean
    npm -w packages/client run build
    npm -w packages/client pack --pack-destination dist

client-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/client run clean
    npm -w packages/client run build
    npm -w packages/client publish
# <<< End @nillion/client <<<


# >>> Start @nillion/react-hooks >>>
react-hooks-dev:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build.watch" \
      "npm -w packages/payments run build.watch" \
      "npm -w packages/client run build.watch" \
      "npm -w packages/react-hooks run start"

react-hooks-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/react-hooks run clean
    npm -w packages/react-hooks run build
    npm -w packages/react-hooks pack --pack-destination dist

react-hooks-publish:
    #!/usr/bin/env bash
    set -e
    npm -w packages/react-hooks run clean
    npm -w packages/react-hooks run build
    npm -w packages/react-hooks publish
# <<< End @nillion/react-hooks <<<


# >>> Start @nillion/examples-react >>>
examples-react-start:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build.watch" \
      "npm -w packages/payments run build.watch" \
      "npm -w packages/client run build.watch" \
      "npm -w packages/react-hooks run build.watch" \
      "npm -w examples/react run start"
# <<< End @nillion/examples-react <<<
