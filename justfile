# TARGET-VERB-FLAGS, if no TARGET specified then it implies all

#
# Start target: all
#
clean:
    #!/usr/bin/env bash
    npm -w packages/core run clean
    npm -w packages/payments run clean
    npm -w packages/client run clean

check:
    #!/usr/bin/env bash
    set -e
    npx prettier -c "packages/**/*.(js|jsx|ts|tsx)"
    npx eslint -c eslint.config.mjs
    npx tsc

check-fix:
    #!/usr/bin/env bash
    set -e
    npx prettier --write -c "packages/**/*.(js|jsx|ts|tsx)"
    npx eslint --fix -c eslint.config.mjs
    npx tsc

test:
    #!/usr/bin/env bash
    # this isn't simple but is required due to wasm + jasmine-browser-runner
    #  - most tests currently fail in non-interactive mode (ie run test rather than run serve)
    #  - building for a test is done via webpack building as a dep is done via esbuild
    #  - this expects the rust monorepo's nodes fixture to be running, local.json copied over, and required program bins
    just core-test
    just payments-tests
    just client-tests

pack:
    #!/usr/bin/env bash
    set -e
    just wasm-pack
    just core-pack
    just payments-pack
    just client-pack
#
# End target: all
#


#
# Start target: wasm
#
wasm-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/wasm pack --pack-destination dist
#
# End target: wasm
#

#
# Start target: core
#
core-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build:test -- --watch" \
      "npm -w packages/core run serve"

core-pack:
    #!/usr/bin/env bash
    set -e
    just clean
    npm -w packages/core run build
    npm -w packages/core pack --pack-destination dist
#
# End target: core
#

#
# Start target: payments
#
payments-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build -- --watch" \
      "npm -w packages/payments run build:test -- --watch" \
      "npm -w packages/payments run serve"

payments-pack:
    #!/usr/bin/env bash
    set -e
    just clean
    npm -w packages/payments run build
    npm -w packages/payments pack --pack-destination dist
#
# End target: payments
#

#
# Start target: client
#
client-test:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build -- --watch" \
      "npm -w packages/payments run build -- --watch" \
      "npm -w packages/client run build:test -- --watch" \
      "npm -w packages/client run serve"

client-pack:
    #!/usr/bin/env bash
    set -e
    just clean
    npm -w packages/client run build
    npm -w packages/client pack --pack-destination dist
#
# End target: client
#

#
# Start target: client
#
example-react-dev:
    #!/usr/bin/env bash
    set -e
    just clean
    npx concurrently -c "auto" \
      "npm -w packages/core run build -- --watch" \
      "npm -w packages/payments run build -- --watch" \
      "npm -w packages/client run build -- --watch" \
      "npm -w packages/react-hooks run build -- --watch" \
      "npm -w examples/react run start"
#
# End target: client
#
