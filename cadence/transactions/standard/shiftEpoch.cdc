import FlowEpochProxy from "../../contracts/FlowEpochProxy.cdc"

transaction() {

  prepare(acct: AuthAccount) {
    FlowEpochProxy.shiftCurrentEpoch(shift: 1)
  }

  execute {}
}
 