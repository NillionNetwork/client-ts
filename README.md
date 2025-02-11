# Welcome to Nillion's client-ts monorepo

This monorepo contains TypeScript client libraries for interacting with Nillion blind compute networks.

## Quick start

```shell
npx create-nillion-app@latest
```

See our [Quick Start Guide](https://docs.nillion.com/quickstart-install) for more details.

## Installation

```shell
# Using npm
npm install @nillion/client-wasm @nillion/client-vms @nillion/client-react-hooks
```

```shell
# Using pnpm
pnpm add @nillion/client-wasm @nillion/client-vms @nillion/client-react-hooks
```

```shell
# Using yarn
yarn add @nillion/client-wasm @nillion/client-vms @nillion/client-react-hooks
```

## Documentation & Examples

- 📚 [Official Documentation](https://docs.nillion.com/) - Learn about blind computation and our tooling.
- 💻 [Code examples](./client-vms/tests/) - See the TypeScript client in action
- ⚛️ [React Hooks](./client-react-hooks/) - Learn how to use our React hooks

### Build docs from source tree

Clone this repo, and from the repo root run:
```shell
pnpm -F client-vms docs
```

## Packages

- `@nillion/client-react-hooks` - React hooks built on `@nillion/client-vms` and `@tanstack/react-query`
- `@nillion/client-vms` - Primary gRPC client combining payments and network operations into a simple API (supports web
  and Node.js)
- `@nillion/client-wasm` - Utility functions exported from Rust to WebAssembly

## Contributing

We welcome contributions! Here's how you can help:

- 🐛 Report bugs and submit feature ideas
- 🔧 Submit pull requests
- 📖 Improve documentation
- 💬 Join discussions
- ⭐ Star the repository
