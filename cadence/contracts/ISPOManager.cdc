import FungibleToken from "./standard/FungibleToken.cdc"
import FlowIDTableStaking from "./standard/FlowIDTableStaking.cdc"
import FlowEpoch from "./standard/FlowEpoch.cdc"

pub contract ISPOManager {

    // ISPORecord

    pub struct ISPORecordInfo {
        access(self) let id: UInt64
        access(self) let rewardTokenBalance: UFix64
        access(self) let rewardTokenMetadata: ISPOManager.RewardTokenMetadata
        access(self) let epochStart: UInt64
        access(self) let epochEnd: UInt64

        init(
            id: UInt64,
            rewardTokenBalance: UFix64,
            rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
            epochStart: UInt64,
            epochEnd: UInt64,
        ) {
            self.id = id
            self.rewardTokenBalance = rewardTokenBalance
            self.rewardTokenMetadata = rewardTokenMetadata
            self.epochStart = epochStart
            self.epochEnd = epochEnd
        }
    }

    pub resource DelegatorRecord {
        access(self) let nodeDelegator: @FlowIDTableStaking.NodeDelegator
        access(self) let epochFlowCommitments: {UInt64: UFix64}
        pub var hasWithdrawRewardToken: Bool

        init(nodeDelegator: @FlowIDTableStaking.NodeDelegator) {
            self.nodeDelegator <- nodeDelegator
            self.epochFlowCommitments = {}
            self.hasWithdrawRewardToken = false
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

        pub fun getEpochFlowCommitments(): {UInt64: UFix64} {
            return self.epochFlowCommitments
        }

        pub fun setHasWithrawnRewardToken() {
            self.hasWithdrawRewardToken = true
        }

        pub fun withdrawRewards(): @FungibleToken.Vault {
            let rewardBalance: UFix64 = FlowIDTableStaking.DelegatorInfo(nodeID: self.nodeDelegator.nodeID, delegatorID: self.nodeDelegator.id).tokensRewarded
            return <- self.nodeDelegator.withdrawRewardedTokens(amount: rewardBalance)
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
        pub let rewardTokenMetadata: ISPOManager.RewardTokenMetadata

        init(
            id: UInt64,
            rewardTokenVault: @FungibleToken.Vault,
            rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
            epochStart: UInt64,
            epochEnd: UInt64,
        ) {
            self.id = id
            self.rewardTokenVault <- rewardTokenVault
            self.rewardTokenMetadata = rewardTokenMetadata
            self.delegators <- {}
            self.epochStart = epochStart
            self.epochEnd = epochEnd
        }

        access(self) fun isISPOActive(): Bool {
            let currentEpoch: UInt64 = FlowEpoch.currentEpochCounter
            return currentEpoch >= self.epochStart && currentEpoch <= self.epochEnd
        }

        pub fun getInfo(): ISPORecordInfo {
            return ISPORecordInfo(id: self.id, rewardTokenBalance: self.rewardTokenVault.balance, rewardTokenMetadata: self.rewardTokenMetadata, epochStart: self.epochStart, epochEnd: self.epochEnd)
        }

        pub fun delegateNewTokens(delegatorId: UInt64, flowVault: @FungibleToken.Vault) {
            pre {
                self.isISPOActive(): "ISPO is not active"
            }

            if (self.delegators.containsKey(delegatorId)) {
                self.borrowDelegatorRecord(delegatorId: delegatorId).delegateNewTokens(flowVault: <- flowVault)
            } else {
                let nodeId: String = ISPOManager.defaultNodeId // TODO: possibly get as setting from ISPORecord
                let nodeDelegator: @FlowIDTableStaking.NodeDelegator <- FlowIDTableStaking.registerNewDelegator(nodeID: nodeId) 

                let newDelegatorRecord: @ISPOManager.DelegatorRecord <- create DelegatorRecord(nodeDelegator: <- nodeDelegator)
                newDelegatorRecord.delegateNewTokens(flowVault: <- flowVault)
                self.delegators[delegatorId] <-! newDelegatorRecord
            }
        }

        access(self) fun borrowDelegatorRecord(delegatorId: UInt64): &DelegatorRecord {
            pre {
                self.delegators.containsKey(delegatorId): "Specified delegator ID does not exist"
            }
            return (&self.delegators[delegatorId] as &DelegatorRecord?)!
        }

        access(self) fun getDelegatorWeights(delegatorRef: &ISPOManager.DelegatorRecord): {UInt64: UFix64} {
            let epochFlowCommitments: {UInt64: UFix64} = delegatorRef.getEpochFlowCommitments()

            var epochIndexIterator: UInt64 = self.epochStart
            var weights: {UInt64: UFix64} = {}
            var lastCommitedValue: UFix64 = 0.0
            while (epochIndexIterator <= self.epochEnd) {
                let epochCommitment: UFix64? = epochFlowCommitments[epochIndexIterator]
                if (epochCommitment != nil) {
                    lastCommitedValue = lastCommitedValue + epochCommitment!
                } 
                weights[epochIndexIterator] = lastCommitedValue
                epochIndexIterator = epochIndexIterator + 1
            }
            return weights
        }

        access(self) fun getTotalDelegatorWeights(): {UInt64: UFix64} {
            var totalWeights: {UInt64: UFix64} = {}
            for key in self.delegators.keys {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: key)
                let delegatorEpochWeights: {UInt64: UFix64} = self.getDelegatorWeights(delegatorRef: delegatorRef)

                var epochIndexIterator: UInt64 = self.epochStart
                while (epochIndexIterator <= self.epochEnd) {
                    let epochCommitment: UFix64? = delegatorEpochWeights[epochIndexIterator]!
                    if (totalWeights[epochIndexIterator] != nil) {
                        totalWeights[epochIndexIterator] = epochCommitment!
                    } 
                    totalWeights[epochIndexIterator] = totalWeights[epochIndexIterator]! + epochCommitment!
                    epochIndexIterator = epochIndexIterator + 1
                }
            }
            return totalWeights
        }

        pub fun withdrawRewardTokens(delegatorId: UInt64): @FungibleToken.Vault {
            pre {
                !self.isISPOActive(): "ISPO must be inactive to withdraw reward tokens"
            }
            let totalWeights: {UInt64: UFix64} = self.getTotalDelegatorWeights()
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
            if (delegatorRef.hasWithdrawRewardToken) {
                panic("Reward token has already been withdrawn")
            }
            let delegatorWeights: {UInt64: UFix64} = self.getDelegatorWeights(delegatorRef: delegatorRef)

            let totalRewardTokenAmountPerEpoch: UFix64 = self.rewardTokenMetadata.totalRewardTokenAmount / UFix64(self.epochEnd - self.epochStart)
            var rewardAmount: UFix64 = 0.0
            var epochIndexIterator: UInt64 = self.epochStart
            while (epochIndexIterator <= self.epochEnd) {
                rewardAmount = rewardAmount + (totalRewardTokenAmountPerEpoch * (delegatorWeights[epochIndexIterator]! / totalWeights[epochIndexIterator]!)) // TODO: remove division?
                epochIndexIterator = epochIndexIterator + 1
            }
            delegatorRef.setHasWithrawnRewardToken()
            return <- self.rewardTokenVault.withdraw(amount: rewardAmount)
        }

        pub fun withdrawDelegatorRewards(): @FungibleToken.Vault {
            var totalRewardsVault: @FungibleToken.Vault? <- nil
            for key in self.delegators.keys {
                if (totalRewardsVault == nil) {
                    totalRewardsVault <-! self.borrowDelegatorRecord(delegatorId: key).withdrawRewards()
                } else {
                    let totalRewardsVaultRef: &FungibleToken.Vault? = &totalRewardsVault as &FungibleToken.Vault?
                    totalRewardsVaultRef!.deposit(from: <- self.borrowDelegatorRecord(delegatorId: key).withdrawRewards())
                }
                
            }
            return <- totalRewardsVault!
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

    pub fun getISPORewardTokenMetadata(id: UInt64): ISPOManager.RewardTokenMetadata {
        return self.borrowISPORecord(id: id).rewardTokenMetadata
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

    access(contract) fun recordISPO(id: UInt64, rewardTokenVault: @FungibleToken.Vault, rewardTokenMetadata: ISPOManager.RewardTokenMetadata, epochStart: UInt64, epochEnd: UInt64) {
        pre {
            !self.ispoRecords.containsKey(id): "Resource with same id already exists"
        }
        var tmpRecord: @ISPORecord? <- create ISPORecord(id: id, rewardTokenVault: <- rewardTokenVault, rewardTokenMetadata: rewardTokenMetadata, epochStart: epochStart, epochEnd: epochEnd)
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

    pub struct RewardTokenMetadata {
        pub let rewardTokenVaultStoragePath: StoragePath
        pub let rewardTokenReceiverPublicPath: PublicPath
        pub let rewardTokenBalancePublicPath: PublicPath
        pub let totalRewardTokenAmount: UFix64

        init(
            rewardTokenVaultStoragePath: StoragePath,
            rewardTokenReceiverPublicPath: PublicPath,
            rewardTokenBalancePublicPath: PublicPath,
            totalRewardTokenAmount: UFix64
        ) {
            self.rewardTokenVaultStoragePath = rewardTokenVaultStoragePath
            self.rewardTokenReceiverPublicPath = rewardTokenReceiverPublicPath
            self.rewardTokenBalancePublicPath = rewardTokenBalancePublicPath
            self.totalRewardTokenAmount = totalRewardTokenAmount
        }
    }

    pub resource ISPOAdmin {

        init (
            rewardTokenVault: @FungibleToken.Vault,
            rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
            epochStart: UInt64,
            epochEnd: UInt64,
        ) {
            ISPOManager.recordISPO(id: self.uuid, rewardTokenVault: <- rewardTokenVault, rewardTokenMetadata: rewardTokenMetadata, epochStart: epochStart, epochEnd: epochEnd)
        }

        pub fun withdrawDelegatorRewards(): @FungibleToken.Vault {
            return <- ISPOManager.borrowISPORecord(id: self.uuid).withdrawDelegatorRewards()
        }

        destroy() {
            ISPOManager.removeISPORecord(id: self.uuid)
        }
    }

    pub fun createISPOAdmin(
        rewardTokenVault: @FungibleToken.Vault,
        rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
        epochStart: UInt64,
        epochEnd: UInt64
    ): @ISPOAdmin {
        return <- create ISPOAdmin(
            rewardTokenVault: <- rewardTokenVault,
            rewardTokenMetadata: rewardTokenMetadata,
            epochStart: epochStart,
            epochEnd: epochEnd
        )
    }

    // ISPOClient

    pub let ispoClientStoragePath: StoragePath

    pub resource ISPOClient {
        pub let ispoId: UInt64

        init(ispoId: UInt64, flowVault: @FungibleToken.Vault) {
            self.ispoId = ispoId
            let ispoRecordRef: &ISPOManager.ISPORecord = ISPOManager.borrowISPORecord(id: ispoId)
            ispoRecordRef.delegateNewTokens(delegatorId: self.uuid, flowVault: <- flowVault)
        }

        pub fun delegateNewTokens(flowVault: @FungibleToken.Vault) {
            let ispoRecordRef: &ISPOManager.ISPORecord = ISPOManager.borrowISPORecord(id: self.ispoId)
            ispoRecordRef.delegateNewTokens(delegatorId: self.uuid, flowVault: <- flowVault)
        }

        pub fun withdrawRewardTokens(): @FungibleToken.Vault {
            let ispoRecordRef: &ISPOManager.ISPORecord = ISPOManager.borrowISPORecord(id: self.ispoId)
            return <- ispoRecordRef.withdrawRewardTokens(delegatorId: self.uuid)
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
 