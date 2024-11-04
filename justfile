# >>> Start all >>>
check:
    #!/usr/bin/env bash
    set -uxo pipefail
    pnpm exec prettier -c "**/*.(js|jsx|mjs|ts|tsx)"
    pnpm exec eslint -c eslint.config.mjs
    pnpm exec tsc -p client-vms/tsconfig.json

watch-and-build:
    #!/usr/bin/env bash
    set -uxo pipefail
    just clean
    pnpm exec concurrently -c "auto" \
      "pnpm --filter client-vms run build:watch" \
      "pnpm --filter client-react-hooks run build:watch"

test:
    #!/usr/bin/env bash
    set -euxo pipefail
    just test-client-vms

pack:
    #!/usr/bin/env bash
    set -euxo pipefail
    just clean
    just client-vms-pack
    just client-react-hooks-pack

unpublish:
    #!/usr/bin/env bash
    set -euxo pipefail
    echo "warning: only for use with a local registry"
    pnpm unpublish --force @nillion/client-wasm --registry=http://localhost:4873
    pnpm unpublish --force @nillion/client-vms --registry=http://localhost:4873
    pnpm unpublish --force @nillion/client-react-hooks --registry=http://localhost:4873

publish args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    just publish-client-wasm "{{args}}"
    just publish-client-vms "{{args}}"
    just publish-client-react-hooks "{{args}}"
# <<< End all <<<


# >>> Start @nillion/client-wasm >>>
pack-client-wasm:
    #!/usr/bin/env bash
    set -euxo pipefail
    mkdir dist
    pnpm --filter client-wasm pack --pack-destination dist

publish-client-wasm args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    pnpm --filter client-wasm publish {{args}}
# <<< End @nillion/client-wasm <<<

# >>> Start @nillion/client-vms >>>
test-client-vms-ci:
    #!/usr/bin/env bash
    set -uxo pipefail
    pushd /Users/tim/projects/NillionNetwork/nillion/main
    RUST_LOG=node:components=INFO cargo run -p nillion-devnet -- --seed test-fixture &2> /dev/null
    echo "Sleeping for 30s while nillion-devnet warms up"
    sleep 10
    popd
    just clean
    pnpm --filter client-vms run build:proto
    pnpm --filter client-vms run test -- --coverage
    echo "Tidying up"
    killall -9 nillion-devnet

client-vms-compile-nada:
    #!/usr/bin/env bash
    pushd client-vms/tests/nada
    ./build.sh
    popd

test-client-vms:
    #!/usr/bin/env bash
    set -euxo pipefail
    pnpm --filter client-vms run build:proto
    pnpm --filter client-vms run test

pack-client-vms:
    #!/usr/bin/env bash
    set -euxo pipefail
    mkdir dist
    pnpm --filter client-vms run clean
    pnpm --filter client-vms run build
    pnpm --filter client-vms pack --pack-destination dist

publish-client-vms args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    pnpm --filter client-vms run clean
    pnpm --filter client-vms run build
    pnpm --filter client-vms publish {{args}}
# <<< End @nillion/client-vms <<<


# >>> Start @nillion/client-react-hooks >>>
pack-client-react-hooks:
    #!/usr/bin/env bash
    set -euxo pipefail
    pnpm --filter client-react-hooks run clean
    pnpm --filter client-react-hooks run build
    pnpm --filter client-react-hooks pack --pack-destination dist

publish-client-react-hooks args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    pnpm --filter client-react-hooks run clean
    pnpm --filter client-react-hooks run build
    pnpm --filter client-react-hooks publish {{args}}
# <<< End @nillion/client-react-hooks <<<
