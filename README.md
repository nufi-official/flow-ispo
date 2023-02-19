Run

- `flow emulator`
- `flow project deploy`
- `flow transactions send ./cadence/transactions/admin/createISPO.cdc 5 10 "ISPO1Vault" "ISPO1Receiver" "ISPO1Balance" 0.5 `
- `flow scripts execute ./cadence/scripts/getISPOInfos.cdc`
- `flow transactions send ./cadence/transactions/admin/destroyISPO.cdc`
