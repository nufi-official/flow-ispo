import FlowEpoch from 0xFlowEpoch

pub fun main(acct: Address): UInt64 {
  return FlowEpoch.currentEpochCounter
}
 