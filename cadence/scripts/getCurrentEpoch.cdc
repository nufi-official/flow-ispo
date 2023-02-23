import FlowEpoch from "../contracts/standard/FlowEpoch.cdc"

pub fun main(): UInt64 {
  return FlowEpoch.currentEpochCounter
}
 