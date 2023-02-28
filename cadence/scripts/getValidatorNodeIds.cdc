import FlowIDTableStaking from "../contracts/standard/FlowIDTableStaking.cdc"

pub fun main(address: Address): [String] {
    return FlowIDTableStaking.getProposedNodeIDs()
}
