import FlowEpoch from "./standard/FlowEpoch.cdc"

pub contract FlowEpochProxy {
  access(contract) var epochShift: Int64

  pub fun getEpochShift(): Int64 {
    return self.epochShift
  }

  // TODO restrict access
  pub fun setEpochShift(shift: Int64) {
    self.epochShift = shift
  }

  pub fun getCurrentEpoch(): UInt64 {
    return UInt64(Int64(FlowEpoch.currentEpochCounter) + self.epochShift)
  }

  init() {
    self.epochShift = 0
  }
}
