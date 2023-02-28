#!/bin/bash

flow transactions send ./cadence/transactions/admin/createISPO.cdc "ExampleISPO" "https:lala" "This is just an example ISPO" "lalalogo" "26c1cd3254ec259b4faea0f53e3a446539256d81f0c06fff430690433d69731f" 2 5 "rewardToken" "rewardTokenReceiver" "rewardTokenBalance" "100.0"
 