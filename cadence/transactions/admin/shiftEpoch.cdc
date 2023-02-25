import FlowEpochProxy from "../../contracts/FlowEpochProxy.cdc"

transaction() {

  prepare(acct: AuthAccount) {
    let currentEpochShift = FlowEpochProxy.getEpochShift()
    FlowEpochProxy.setEpochShift(shift: currentEpochShift + 1)
  }

  execute {}
}
