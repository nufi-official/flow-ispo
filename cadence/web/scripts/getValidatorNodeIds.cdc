import FlowIDTableStaking from 0xFlowIDTableStaking

pub fun main(address: Address): [String] {
    return FlowIDTableStaking.getProposedNodeIDs()
}
