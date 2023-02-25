import FlowEpochProxy from "../contracts/FlowEpochProxy.cdc"

pub fun main(): UInt64 {
  return FlowEpochProxy.getCurrentEpoch()
}
 
