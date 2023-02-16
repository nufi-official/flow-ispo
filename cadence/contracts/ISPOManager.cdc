import FungibleToken from "./standard/FungibleToken.cdc"
import FlowIDTableStaking from "./standard/FlowIdTableStaking.cdc"
import FlowEpoch from "./standard/FlowEpoch.cdc"

pub contract ISPOManager {

    // ISPORecord

    pub struct ISPORecordInfo {
        access(self) let id: UInt64
        access(self) let rewardTokenBalance: UFix64
        access(self) let epochStart: UInt64
        access(self) let epochEnd: UInt64

        init(
            id: UInt64,
            rewardTokenBalance: UFix64,
            epochStart: UInt64,
            epochEnd: UInt64,
        ) {
            self.id = id
            self.rewardTokenBalance = rewardTokenBalance
            self.epochStart = epochStart
            self.epochEnd = epochEnd
        }
    }

    pub resource DelegatorRecord {
        access(self) let nodeDelegator: @FlowIDTableStaking.NodeDelegator
        access(self) let epochFlowCommitments: {UInt64: UFix64}

        init(nodeDelegator: @FlowIDTableStaking.NodeDelegator) {
            self.nodeDelegator <- nodeDelegator
            self.epochFlowCommitments = {}
        }

        access(self) fun updateCurrentEpochFlowCommitment(amount: UFix64) {
            let currentEpoch: UInt64 = FlowEpoch.currentEpochCounter
            if (self.epochFlowCommitments.containsKey(currentEpoch)) {
                let currentEpochCommitment: UFix64 = self.epochFlowCommitments[currentEpoch]!
                self.epochFlowCommitments[currentEpoch] = currentEpochCommitment + amount
            }
            self.epochFlowCommitments[currentEpoch]
        }

        pub fun delegateNewTokens(flowVault: @FungibleToken.Vault) {
            let amount: UFix64 = flowVault.balance
            self.nodeDelegator.delegateNewTokens(from: <- flowVault)
            self.updateCurrentEpochFlowCommitment(amount: amount)
        }

        destroy() {
            pre {
                // TODO: pre conditions for destroying nodeDelegator
            }
            destroy self.nodeDelegator
        }
    }

    pub resource ISPORecord {
        access(self) let id: UInt64
        access(self) let rewardTokenVault: @FungibleToken.Vault
        access(self) let delegators: @{UInt64: DelegatorRecord}
        access(self) let epochStart: UInt64
        access(self) let epochEnd: UInt64

        init(
            id: UInt64,
            rewardTokenVault: @FungibleToken.Vault,
            epochStart: UInt64,
            epochEnd: UInt64,
        ) {
            self.id = id
            self.rewardTokenVault <- rewardTokenVault
            self.delegators <- {}
            self.epochStart = epochStart
            self.epochEnd = epochEnd
        }

        pub fun getInfo(): ISPORecordInfo {
            return ISPORecordInfo(id: self.id, rewardTokenBalance: self.rewardTokenVault.balance, epochStart: self.epochStart, epochEnd: self.epochEnd)
        }

        pub fun createNewDelegator(delegatorId: UInt64, flowVault: @FungibleToken.Vault) {
            pre {
                !self.delegators.containsKey(delegatorId): "Delegator with same id already exists"
            }

            let nodeId: String = ISPOManager.defaultNodeId // TODO: possibly get as setting from ISPORecord
            let nodeDelegator: @FlowIDTableStaking.NodeDelegator <- FlowIDTableStaking.registerNewDelegator(nodeID: nodeId) 

            let newDelegatorRecord: @ISPOManager.DelegatorRecord <- create DelegatorRecord(nodeDelegator: <- nodeDelegator)
            newDelegatorRecord.delegateNewTokens(flowVault: <- flowVault)
            self.delegators[delegatorId] <-! newDelegatorRecord
        }

        destroy() {
            pre {
                self.rewardTokenVault.balance == UFix64(0.0): "ISPO record still hold some reward token, so it cannot be destroyed"
            }
            destroy self.rewardTokenVault
            destroy self.delegators
        }
    }

    access(contract) let ispoRecords: @{UInt64: ISPORecord}
    access(contract) let defaultNodeId: String

    access(contract) fun borrowISPORecord(id: UInt64): &ISPOManager.ISPORecord {
        pre {
            self.ispoRecords.containsKey(id): "Specified ISPO record does not exist"
        }
        return (&self.ispoRecords[id] as &ISPOManager.ISPORecord?)!
    }

    pub fun getISPORecordInfos(): [ISPORecordInfo] {
        let ispoInfos : [ISPORecordInfo] = [] 
        ISPOManager.ispoRecords.forEachKey(fun (key: UInt64): Bool {
           let ispoRecordRef: &ISPOManager.ISPORecord = ISPOManager.borrowISPORecord(id: key)
           ispoInfos.append(ispoRecordRef.getInfo())
           return true
        })
        return ispoInfos
    }

    access(contract) fun recordISPO(id: UInt64, rewardTokenVault: @FungibleToken.Vault, epochStart: UInt64, epochEnd: UInt64) {
        pre {
            !self.ispoRecords.containsKey(id): "Resource with same id already exists"
        }
        var tmpRecord: @ISPORecord? <- create ISPORecord(id: id, rewardTokenVault: <- rewardTokenVault, epochStart: epochStart, epochEnd: epochEnd)
        self.ispoRecords[id] <-> tmpRecord
        // we destroy this "tmpRecord" but at this point it must contain null as it was swapped with previous value of "ispoRecords[id]"
        // https://developers.flow.com/cadence/language/resources
        destroy tmpRecord
    }

    access(contract) fun removeISPORecord(id: UInt64) {
        pre {
            self.ispoRecords.containsKey(id): "Cannot remove ISPO record that does not exist"
        }
        destroy self.ispoRecords.remove(key: id)!
    }

    // ISPOAdmin

    pub let ispoAdminStoragePath: StoragePath
    pub let ispoClientStoragePath: StoragePath
    

    pub resource ISPOAdmin {

        init (rewardTokenVault: @FungibleToken.Vault, epochStart: UInt64, epochEnd: UInt64) {
            ISPOManager.recordISPO(id: self.uuid, rewardTokenVault: <- rewardTokenVault, epochStart: epochStart, epochEnd: epochEnd)
        }

        destroy() {
            ISPOManager.removeISPORecord(id: self.uuid)
        }
    }

    pub fun createISPOAdmin(rewardTokenVault: @FungibleToken.Vault, epochStart: UInt64, epochEnd: UInt64): @ISPOAdmin {
      return <- create ISPOAdmin(rewardTokenVault: <- rewardTokenVault, epochStart: epochStart, epochEnd: epochEnd)
    }

    // ISPOClient

    pub resource ISPOClient {
        access(self) let ispoId: UInt64

        init(ispoId: UInt64, flowVault: @FungibleToken.Vault) {
            self.ispoId = ispoId
            let ispoRecordRef: &ISPOManager.ISPORecord = ISPOManager.borrowISPORecord(id: ispoId)
            ispoRecordRef.createNewDelegator(delegatorId: self.uuid, flowVault: <- flowVault)
        }

        // TODO: destroy
    }

    pub fun createISPOClient(ispoId: UInt64, flowVault: @FungibleToken.Vault): @ISPOClient {
      return <- create ISPOClient(ispoId: ispoId, flowVault: <- flowVault)
    }

    init() {
        self.ispoRecords <- {}
        self.defaultNodeId = ""
        self.ispoAdminStoragePath = /storage/ISPOAdmin
        self.ispoClientStoragePath = /storage/ISPOClient
    }
}
 