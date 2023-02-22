import FlowEpoch from "../contracts/standard/FlowEpoch.cdc"

pub fun main(acct: Address): UInt64 {
  return FlowEpoch.currentEpochCounter
}
 