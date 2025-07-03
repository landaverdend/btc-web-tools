# Bitcoin Script Simulator

A TypeScript implementation of Bitcoin's transaction and script system for learning and experimentation purposes. This project helps understand the internals of Bitcoin transactions, various script types, and how the Bitcoin scripting language works.

## Features

- Full implementation of Bitcoin transaction parsing and serialization
- Support for different transaction types:
  - Legacy transactions (P2PKH)
  - SegWit transactions (P2WPKH, P2WSH)
  - P2SH (including wrapped SegWit)
- Bitcoin Script execution engine with support for:
  - Stack operations
  - Arithmetic operations
  - Cryptographic operations (checksig, hash functions)
  - Flow control operations
- Transaction validation and script verification

## Project Structure

The project is organized into several key components:

- `crypto/transaction/` - Transaction handling and parsing
- `crypto/script/` - Bitcoin Script implementation and execution
- `crypto/op/` - Bitcoin Script opcodes and their implementations
- `crypto/util/` - Helper utilities for byte manipulation and encoding

## Technical Details

### Transaction Processing

The codebase can parse and validate different types of Bitcoin transactions, including:
- Legacy transactions with standard P2PKH scripts
- SegWit transactions with witness data
- Mixed transactions containing both legacy and SegWit inputs

### Script Execution

The script execution engine supports:
- Different script types (P2PKH, P2WPKH, P2WSH, P2SH)
- Signature verification
- Multi-signature operations
- Conditional flow control