#!/bin/bash
flow transactions send ./cadence/transactions/standard/transferFlow.cdc 1000000.0 0x01cf0e2f2f715450
flow project deploy
flow transactions send ./cadence/transactions/standard/setupStakingCollection.cdc
 