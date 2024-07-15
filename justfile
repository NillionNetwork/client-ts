# TARGET-VERB-FLAGS

all-release:
  @just all-build
  npm -w packages/core publish
  npm -w packages/react-hooks publish

all-pack:
  @just core-pack
  @just react-hooks-pack

all-build:
  @just core-build
  @just react-hooks-build

react-hooks-build env="release":
    #!/usr/bin/env bash
    set -e
    npm install
    npm -w packages/react-hooks run clean
    npm -w packages/react-hooks run build

react-hooks-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/react-hooks pack

core-build env="release":
    #!/usr/bin/env bash
    set -e
    npm install
    npm -w packages/core run clean
    npm -w packages/core run build

core-pack:
    #!/usr/bin/env bash
    set -e
    npm -w packages/core pack

all-build-watch:
    #!/usr/bin/env bash
    npx concurrently -c "auto" "npm:core-build-watch" "npm:payments-build-watch" "npm:client-build-watch" "npm:functional-tests-build-watch"

all-clean:
    #!/usr/bin/env bash
    npm -w packages/core run clean
    npm -w packages/payments run clean
    npm -w packages/functional-tests run clean
