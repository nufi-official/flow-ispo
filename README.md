# VELES ISPO DApp

A Flow Dapp that allows projects create on-chain staking-based fundraisers (ISPO - "Initial Stake (Pool) Offering") where users willing to support
them can lock their $FLOW which would be staked by the smart contract, funding the project from the rewards accrued by the delegations.
After the ISPO ends, the users in can claim as a reward a certain amount of a fungible token associated with the ISPO, proportional
to their locked $FLOW and get back the $FLOW their originally locked.

## Cadence contract technical summary

For contracts/transactions/scripts, check the [cadence](/cadence/) folder. The core is the [ISPOManager](/cadence/contracts/ISPOManager.cdc)
contract which consists of several resources:

- `IspoAdmin` - through which projects create ISPOs (`IspoAdmin` resource) where they specify for how long the ISPO will be active and
  provide the token vault resource for the token they plan to distribute as a reward to the delegators. This resource is stored on the respective
  project's account and a `ISPO` resource is stored in the `ISPOManager` contract, containing the token vault and ISPO data (name, epoch range, etc.)
- `IspoClient` - this is the resource through which users can delegate to the ISPO of their choice. A user provides there a vault resource with the $FLOW
they are willing to lock and it gets directly transformed into a delegation to the Flow staking node (specified in the `ISPO` resource, therefore all `$FLOW` for an ISPO is delegated to the same node).
  Once the ISPO is closed, the user can through this resource claim the reward token and get the FLOW released. Since "undelegating" is a multi-step proces, the contract
  transfers instead the full delegation resource to user's account, allowing them to unstake or re-stake their Flow from their wallet of choice.

## Features Provided

- FCL setup and configuration
- Wallet Discovery (including Dev Wallet on Emulator)
- CLI private key separation for security
- Flow.json loading for contract placeholders
- Deployment

## Featues TODO

- Mainnet deployment
- JS Testing

## Getting Started

### Prerequisites

- [Flow-CLI v0.44+](https://github.com/onflow/flow-cli)
- [Node v18](https://nodejs.org/en/download/)

### Setup

1.  Clone/Fork 🏗 scaffold-flow repository to your local machine:

```bash
git clone https://github.com/onflow/scaffold-flow.git
```

2. install required packages:

```bash
cd scaffold-flow
yarn
```

## Running your App

You will be able to run you app locally on the flow emulator immediately after forking! For running on Testnet, you will need to make some configuration changes.

### Emulator

1. In your terminal, use this Flow-CLI command to initialize the flow blockchain emulator:

```bash
flow emulator start
```

2. In a different terminal, use this Flow-CLI command to initilize the Dev Wallet:

```bash
flow dev-wallet
```

3. In a different terminal, use this Flow-CLI command to deploy and manage your contracts. This listener will automatically update and redeploy your contracts as you work!

```bash
flow dev
```

> Ensure your account address is prefixed with `0x`. Add the prefix if missing.
>
> ```
> "default": {
>   "address": "0x0000000000000000", // confirm this address has the prefix
>   "key": "0000000000000000000000000000000000000000000000000000000000000000"
> },
> ```

4. In a different terminal (Last one, promise!), use this command to deploy your contract(s) and initialize the App:

```bash
yarn dev
```

5. You're done! Checkout the App at http://localhost:3000

### Testing ISPO contract with Flow CLI

- `flow emulator`
- `./actions/init.sh `
- `./actions/createNode.sh`
- `./actions/createISPO.sh `
- `flow scripts execute ./cadence/scripts/getCurrentEpoch.cdc`
 