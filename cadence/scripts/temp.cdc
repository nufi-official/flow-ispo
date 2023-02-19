import FlowIDTableStaking from "../contracts/standard/FlowIDTableStaking.cdc"

  // This script returns validator nodes with info

  pub fun main(): [FlowIDTableStaking.NodeInfo] {
    var proposedNodes: [FlowIDTableStaking.NodeInfo] = []

    for nodeID in FlowIDTableStaking.getProposedNodeIDs() {
        var nodeInfo = FlowIDTableStaking.NodeInfo(nodeID)
        // filter out access nodes since we cant delegate to them
        if nodeInfo.role != 5
        {
            proposedNodes.append(nodeInfo)
        }
    }
    return proposedNodes
  }