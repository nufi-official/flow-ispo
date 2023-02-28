import FlowIDTableStaking from "../contracts/standard/FlowIDTableStaking.cdc"

pub fun main(): [String] {
    return FlowIDTableStaking.getProposedNodeIDs()
}
