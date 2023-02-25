import FlowIDTableStaking from 0x01cf0e2f2f715450

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
 