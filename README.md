Run

- `flow emulator`
- `flow project deploy`
- `flow transactions send ./cadence/transactions/admin/mintRewardToken.cdc`
- `flow transactions send ./cadence/transactions/admin/createISPO.cdc 5 10 "ispoExampleRewardTokenVault" "ispoExampleRewardTokenReceiver" "ispoExampleRewardTokenBalance" 1000.0 `
- `flow scripts execute ./cadence/scripts/getISPOInfos.cdc`
- `flow transactions send ./cadence/transactions/admin/destroyISPO.cdc`
