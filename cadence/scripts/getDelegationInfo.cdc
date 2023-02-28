
import FlowIDTableStaking from 0x01cf0e2f2f715450
import FlowStakingCollection from 0x01cf0e2f2f715450
pub fun main(address: Address): [FlowIDTableStaking.DelegatorInfo] {
    return FlowStakingCollection.getAllDelegatorInfo(address: address)
}
