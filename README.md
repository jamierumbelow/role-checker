# role-checker

This repo inspects the current role state for contracts that implement the [OpenZepplin AccessControl](https://docs.openzeppelin.com/contracts/3.x/api/access#AccessControl) interface.

It does so by inspecting the event logs and outputting the associated addresses given the roles.

It was built to explore the [permissions for Fei Protocol](https://docs.fei.money/developer/contract-docs/permissions), but should work for contracts that implement `AccessControl` without too many changes.

## Quickstart

1. Copy `.env.example` to `.env` and fill with relevant values.
2. Run `yarn` to install dependencies
3. Edit the "What are we looking at?" section of `src/index.ts`
4. Run `yarn go` to fetch the roles from the event logs

## How it works

Contracts that implement `AccessControl` describe a series of roles as `bytes32 public constant` hash digests:

    bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

These hashes roles are then checked by modifiers (or elsewhere in the contract) using functions like `hasRole`:

    require(hasRole(PROPOSER_ROLE, msg.sender), "sender must be PROPOSER_ROLE")

This contract takes a user-provided list of role names, fetching the hashes, and outputting a mapping from role names to sets of roles.

## Example output

As of writing (Nov 20th, 2021, ~16:30) the output for Fei's `OptimisticTimelock @ 0xbc9c084a12678ef5b516561df902fdc426d95483` contract is:

    TIMELOCK_ADMIN_ROLE accounts:
    https://etherscan.io/address/0xbC9C084a12678ef5B516561df902fdc426d95483
    https://etherscan.io/address/0xB8f482539F2d3Ae2C9ea6076894df36D1f632775


    CONTRACT_ADMIN_ROLE accounts:


    EXECUTOR_ROLE accounts:
    https://etherscan.io/address/0x35ED000468f397AA943009bD60cc6d2d9a7d32fF
    https://etherscan.io/address/0x40B12d200404C0D082B6D088aB24cEDED6bcf8C2
    https://etherscan.io/address/0xb81cf4981Ef648aaA73F07a18B03970f04d5D8bF
    https://etherscan.io/address/0x7A883825caA45fcbDcd76991C5972Baf1551aa3d


    DEFAULT_ADMIN_ROLE accounts:


    PROPOSER_ROLE accounts:
    https://etherscan.io/address/0x35ED000468f397AA943009bD60cc6d2d9a7d32fF
