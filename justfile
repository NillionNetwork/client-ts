# >>> Start all >>>
clean:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-core run clean
    npm -w packages/client-payments run clean
    npm -w packages/client-vms run clean
    npm -w packages/client-react-hooks run clean
    rm -rf packages/resources/progras/dist

check:
    #!/usr/bin/env bash
    set -uxo pipefail
    npx prettier -c "packages/**/*.(js|jsx|mjs|ts|tsx)"

    echo "Running eslint... "
    npx eslint -c eslint.config.mjs
    echo "done."

    echo "Running tsc... "
    npx tsc -p packages/client-core/tsconfig.json
    npx tsc -p packages/client-payments/tsconfig.json
    npx tsc -p packages/client-vms/tsconfig.json
    npx tsc -p packages/client-react-hooks/tsconfig.json
    echo "done."

watch-and-build:
    #!/usr/bin/env bash
    set -uxo pipefail
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build:watch" \
      "npm -w packages/client-payments run build:watch" \
      "npm -w packages/client-vms run build:watch" \
      "npm -w packages/client-react-hooks run build:watch"

pack:
    #!/usr/bin/env bash
    set -euxo pipefail
    just clean
    just wasm-pack
    just client-core-pack
    just client-payments-pack
    just client-vms-pack
    just client-react-hooks-pack

unpublish:
    #!/usr/bin/env bash
    set -euxo pipefail
    echo "warning: only for use with a local registry"
    npm unpublish --force @nillion/client-wasm --registry=http://localhost:4873
    npm unpublish --force @nillion/client-core --registry=http://localhost:4873
    npm unpublish --force @nillion/client-payments --registry=http://localhost:4873
    npm unpublish --force @nillion/client-vms --registry=http://localhost:4873
    npm unpublish --force @nillion/client-react-hooks --registry=http://localhost:4873

publish args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    just publish-client-wasm "{{args}}"
    just publish-client-core "{{args}}"
    just publish-client-payments "{{args}}"
    just publish-client-vms "{{args}}"
    just publish-client-react-hooks "{{args}}"
# <<< End all <<<


# >>> Start @nillion/client-wasm >>>
pack-client-wasm:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/wasm pack --pack-destination dist

publish-client-wasm args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-wasm publish {{args}}
# <<< End @nillion/client-wasm <<<


# >>> Start @nillion/client-core >>>
test-client-core-ci:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/fixture run start -- --test=core

test-client-core:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-core run clean
    npm -w packages/client-core run test:build
    npm -w packages/client-core run test

test-client-core-serve:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-core run clean
    npx concurrently -c "auto" \
    "npm -w packages/client-core run test:build:watch" \
    "npm -w packages/client-core run test:serve"

pack-client-core:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-core run clean
    npm -w packages/client-core run build
    npm -w packages/client-core pack --pack-destination dist

publish-client-core args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-core run clean
    npm -w packages/client-core run build
    npm -w packages/client-core publish {{args}}
# <<< End @nillion/client-core <<<


# >>> Start @nillion/client-payments >>>
test-client-payments-ci:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/fixture run start -- --test=payments

test-client-payments:
    #!/usr/bin/env bash
    set -euxo pipefail
    just clean
    npm -w packages/client-payments run build:proto
    npm -w packages/client-core run build
    npm -w packages/client-payments run test:build
    npm -w packages/client-payments run test

test-client-payments-serve:
    #!/usr/bin/env bash
    set -euxo pipefail
    just clean
    npm -w packages/client-payments run build:proto
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build:watch" \
      "npm -w packages/client-payments run test:build:watch" \
      "npm -w packages/client-payments run test:serve"

pack-client-payments:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-payments run clean
    npm -w packages/client-payments run build
    npm -w packages/client-payments pack --pack-destination dist

publish-client-payments args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-payments run clean
    npm -w packages/client-payments run build
    npm -w packages/client-payments publish {{args}}
# <<< End @nillion/client-payments <<<


# >>> Start @nillion/client-vms >>>
test-client-vms-ci:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/fixture run start -- --test=vms

test-client-vms:
    #!/usr/bin/env bash
    set -euxo pipefail
    just clean
    npm -w packages/client-core run build
    npm -w packages/client-payments run build
    npm -w packages/client-vms run test:build
    npm -w packages/client-vms run test

test-client-vms-serve:
    #!/usr/bin/env bash
    set -euxo pipefail
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/client-core run build:watch" \
      "npm -w packages/client-payments run build:watch" \
      "npm -w packages/client-vms run test:build:watch" \
      "npm -w packages/client-vms run test:serve"

pack-client-vms:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-vms run clean
    npm -w packages/client-vms run build
    npm -w packages/client-vms pack --pack-destination dist

publish-client-vms args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-vms run clean
    npm -w packages/client-vms run build
    npm -w packages/client-vms publish {{args}}
# <<< End @nillion/client-vms <<<


# >>> Start @nillion/client-react-hooks >>>
pack-client-react-hooks:
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-react-hooks run clean
    npm -w packages/client-react-hooks run build
    npm -w packages/client-react-hooks pack --pack-destination dist

publish-client-react-hooks args="":
    #!/usr/bin/env bash
    set -euxo pipefail
    npm -w packages/client-react-hooks run clean
    npm -w packages/client-react-hooks run build
    npm -w packages/client-react-hooks publish {{args}}
# <<< End @nillion/client-react-hooks <<<
