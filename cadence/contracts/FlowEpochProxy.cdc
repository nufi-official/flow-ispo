import FlowEpoch from "./standard/FlowEpoch.cdc"

pub contract FlowEpochProxy {
  pub var currentEpochCounter: UInt64

  // TODO restrict access
  pub fun shiftCurrentEpoch(shift: UInt64) {
    self.currentEpochCounter = self.currentEpochCounter + shift
  }

  init() {
    self.currentEpochCounter = 0
  }
}