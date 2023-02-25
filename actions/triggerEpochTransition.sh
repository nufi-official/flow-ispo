#!/bin/bash
flow transactions send ./cadence/transactions/standard/endStaking.cdc "26c1cd3254ec259b4faea0f53e3a446539256d81f0c06fff430690433d69731f" --signer emulator-user
flow transactions send ./cadence/transactions/standard/moveStake.cdc --signer emulator-user
flow transactions send ./cadence/transactions/standard/endStaking.cdc "26c1cd3254ec259b4faea0f53e3a446539256d81f0c06fff430690433d69731f" --signer emulator-user
flow transactions send ./cadence/transactions/standard/payRewards.cdc --signer emulator-user
flow transactions send ./cadence/transactions/standard/moveStake.cdc --signer emulator-user
flow transactions send ./cadence/transactions/standard/shiftEpoch.cdc