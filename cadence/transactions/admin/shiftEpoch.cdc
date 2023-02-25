import FlowEpochProxy from "../../contracts/FlowEpochProxy.cdc"

transaction(epochShift: Int64) {

  prepare(acct: AuthAccount) {
    FlowEpochProxy.setEpochShift(shift: epochShift)
  }

  execute {}
}
