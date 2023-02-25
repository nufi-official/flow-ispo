import FungibleToken from "./standard/FungibleToken.cdc"
import FlowIDTableStaking from "./standard/FlowIDTableStaking.cdc"
import FlowToken from "./standard/FlowToken.cdc"
import FlowEpochProxy from "./FlowEpochProxy.cdc"

pub contract ISPOManager {

    // ISPO

    pub struct ISPOInfo {
        access(self) let id: UInt64
        access(self) let name: String
        access(self) let projectUrl: String
        access(self) let projectDescription: String
        access(self) let logoUrl: String
        access(self) let rewardTokenBalance: UFix64
        access(self) let rewardTokenMetadata: ISPOManager.RewardTokenMetadata
        access(self) let epochStart: UInt64
        access(self) let epochEnd: UInt64
        access(self) let delegationsCount: Int
        access(self) let delegatedFlowBalance: UFix64
        access(self) let flowRewardsBalance: UFix64
        access(self) let createdAt: UFix64

        init(
            id: UInt64,
            name: String,
            projectUrl: String,
            projectDescription: String,
            logoUrl: String,
            rewardTokenBalance: UFix64,
            rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
            epochStart: UInt64,
            epochEnd: UInt64,
            delegationsCount: Int,
            delegatedFlowBalance: UFix64,
            flowRewardsBalance: UFix64,
            createdAt: UFix64,
        ) {
            self.id = id
            self.name = name
            self.projectUrl = projectUrl
            self.projectDescription = projectDescription
            self.logoUrl = logoUrl
            self.rewardTokenBalance = rewardTokenBalance
            self.rewardTokenMetadata = rewardTokenMetadata
            self.epochStart = epochStart
            self.epochEnd = epochEnd
            self.delegationsCount = delegationsCount
            self.delegatedFlowBalance = delegatedFlowBalance
            self.flowRewardsBalance = flowRewardsBalance
            self.createdAt = createdAt
        }
    }

    pub resource DelegatorRecord {
        access(self) var nodeDelegator: @FlowIDTableStaking.NodeDelegator?
        access(self) let epochFlowCommitments: {UInt64: UFix64}
        pub var withdrawnFlowTokenRewardAmount: UFix64
        pub var hasWithdrawRewardToken: Bool

        init(nodeDelegator: @FlowIDTableStaking.NodeDelegator) {
            self.nodeDelegator <- nodeDelegator
            self.epochFlowCommitments = {}
            self.hasWithdrawRewardToken = false
            self.withdrawnFlowTokenRewardAmount = 0.0
        }

        access(self) fun updateCurrentEpochFlowCommitment(amount: UFix64) {
            let currentEpoch: UInt64 = FlowEpochProxy.getCurrentEpoch()
            if (self.epochFlowCommitments.containsKey(currentEpoch)) {
                let currentEpochCommitment: UFix64 = self.epochFlowCommitments[currentEpoch]!
                self.epochFlowCommitments[currentEpoch] = currentEpochCommitment + amount
            } else {
                self.epochFlowCommitments[currentEpoch] = amount
            }
        }

        access(self) fun borrowNodeDelegator(): &FlowIDTableStaking.NodeDelegator? {
            return (&self.nodeDelegator as &FlowIDTableStaking.NodeDelegator?)
        }

        pub fun delegateNewTokens(flowVault: @FungibleToken.Vault) {
            let amount: UFix64 = flowVault.balance
            self.borrowNodeDelegator()!.delegateNewTokens(from: <- flowVault)
            self.updateCurrentEpochFlowCommitment(amount: amount)
        }

        pub fun getEpochFlowCommitments(): {UInt64: UFix64} {
            return self.epochFlowCommitments
        }

        pub fun setHasWithrawnRewardToken() {
            self.hasWithdrawRewardToken = true
        }

        pub fun withdrawRewards(amount: UFix64): @FungibleToken.Vault {
            self.withdrawnFlowTokenRewardAmount = self.withdrawnFlowTokenRewardAmount + amount
            let nodeDelegatorRef: &FlowIDTableStaking.NodeDelegator? = self.borrowNodeDelegator()
            if nodeDelegatorRef == nil {
                return <- FlowToken.createEmptyVault()
            }
            return <- self.borrowNodeDelegator()!.withdrawRewardedTokens(amount: amount)
        }

        // current delegator rewards plus those previously withdrawn
        pub fun getTotalRewardsReceived(): UFix64 {
            let nodeDelegatorRef: &FlowIDTableStaking.NodeDelegator? = self.borrowNodeDelegator()
            // TODO fix, this is just a workaround to not crash after withdrawing flow
            if (nodeDelegatorRef == nil) {
                return self.withdrawnFlowTokenRewardAmount
            }
            let rewardBalance: UFix64 = FlowIDTableStaking.DelegatorInfo(nodeID: nodeDelegatorRef!.nodeID, delegatorID: nodeDelegatorRef!.id).tokensRewarded
            return rewardBalance + self.withdrawnFlowTokenRewardAmount
        }

        pub fun withdrawNodeDelegator(): @FlowIDTableStaking.NodeDelegator {
            // TODO: preconditions
            var nodeDelegator:  @FlowIDTableStaking.NodeDelegator? <- self.nodeDelegator <- nil
            return <- nodeDelegator!
        }

        pub fun hasNodeDelegator(): Bool {
            return self.borrowNodeDelegator() != nil
        }

        destroy() {
            pre {
                // TODO: pre conditions for destroying nodeDelegator
            }
            destroy self.nodeDelegator
        }
    }

    pub resource ISPO {
        access(self) let id: UInt64
        access(self) let name: String
        access(self) let projectUrl: String
        access(self) let projectDescription: String
        access(self) let logoUrl: String
        access(self) let delegatorNodeId: String
        access(self) let rewardTokenVault: @FungibleToken.Vault
        access(self) let delegators: @{UInt64: DelegatorRecord}
        access(self) let epochStart: UInt64
        access(self) let epochEnd: UInt64 // TODO: rename to endEpoch/startEpoch
        access(self) let createdAt: UFix64
        access(self) var stakingRewardsVault: @FungibleToken.Vault? // used for cumulating reward when delegator decides to unstake
        pub let rewardTokenMetadata: ISPOManager.RewardTokenMetadata

        init(
            id: UInt64,
            name: String,
            projectUrl: String,
            projectDescription: String,
            logoUrl: String,
            delegatorNodeId: String,
            rewardTokenVault: @FungibleToken.Vault,
            rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
            epochStart: UInt64,
            epochEnd: UInt64,
            createdAt: UFix64,
        ) {
            self.id = id
            self.name = name
            self.projectUrl = projectUrl
            self.projectDescription = projectDescription
            self.logoUrl = logoUrl
            self.delegatorNodeId = delegatorNodeId
            self.rewardTokenVault <- rewardTokenVault
            self.rewardTokenMetadata = rewardTokenMetadata
            self.delegators <- {}
            self.epochStart = epochStart
            self.epochEnd = epochEnd
            self.stakingRewardsVault <- FlowToken.createEmptyVault()
            self.createdAt = createdAt
        }

        access(self) fun isISPOActive(): Bool {
            let currentEpoch: UInt64 = FlowEpochProxy.getCurrentEpoch()
            return currentEpoch >= self.epochStart && currentEpoch <= self.epochEnd
        }

        pub fun getInfo(): ISPOInfo {
            return ISPOInfo(
                id: self.id,
                name: self.name,
                projectUrl: self.projectUrl,
                projectDescription: self.projectDescription,
                logoUrl: self.logoUrl,
                rewardTokenBalance: self.rewardTokenVault.balance,
                rewardTokenMetadata: self.rewardTokenMetadata,
                epochStart: self.epochStart,
                epochEnd: self.epochEnd,
                delegationsCount: self.getDelegatorsCount(),
                delegatedFlowBalance: self.getTotalDelegatedFlowBalance(),
                flowRewardsBalance: self.getTotalFlowRewardsBalance(),
                createdAt: self.createdAt,
            )
        }

        pub fun delegateNewTokens(delegatorId: UInt64, flowVault: @FungibleToken.Vault) {
            pre {
                self.isISPOActive(): "ISPO is not active"
            }

            if (self.delegators.containsKey(delegatorId)) {
                self.borrowDelegatorRecord(delegatorId: delegatorId)!.delegateNewTokens(flowVault: <- flowVault)
            } else {
                let nodeId: String = self.delegatorNodeId
                let nodeDelegator: @FlowIDTableStaking.NodeDelegator <- FlowIDTableStaking.registerNewDelegator(nodeID: nodeId) 

                let newDelegatorRecord: @ISPOManager.DelegatorRecord <- create DelegatorRecord(nodeDelegator: <- nodeDelegator)
                newDelegatorRecord.delegateNewTokens(flowVault: <- flowVault)
                self.delegators[delegatorId] <-! newDelegatorRecord
            }
        }

        access(self) fun borrowDelegatorRecord(delegatorId: UInt64): &DelegatorRecord? {
            return (&self.delegators[delegatorId] as &DelegatorRecord?)
        }

        // returns "prefix sum" array of commited tokens 
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

        access(self) fun getDelegatorsCount(): Int {
            return self.delegators.keys.length
        }

        // sums all delegated flow
        access(self) fun getTotalDelegatedFlowBalance(): UFix64 {
            var res: UFix64 = 0.0
            for delegatorKey in self.delegators.keys {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorKey)!
                let commitments = delegatorRef.getEpochFlowCommitments()
                for commitmentKey in commitments.keys {
                    res = res + commitments[commitmentKey]!
                }
            }
            return res
        }

        // sums all delegated available flow rewards
        access(self) fun getTotalFlowRewardsBalance(): UFix64 {
            var res: UFix64 = 0.0
            for key in self.delegators.keys {
                let delegatorRecordRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: key)!
                let adminRewardAmount: UFix64 = self.calculateAdminRewardAmount(delegatorRef: delegatorRecordRef)
                res = res + adminRewardAmount
            }
            return res
        }

        // sums all delegator weighs, (per epoch)
        access(self) fun getTotalDelegatorWeights(): {UInt64: UFix64} {
            var totalWeights: {UInt64: UFix64} = {}
            for key in self.delegators.keys {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: key)!
                let delegatorEpochWeights: {UInt64: UFix64} = self.getDelegatorWeights(delegatorRef: delegatorRef)

                var epochIndexIterator: UInt64 = self.epochStart
                while (epochIndexIterator <= self.epochEnd) {
                    let epochCommitment: UFix64? = delegatorEpochWeights[epochIndexIterator]!
                    if (totalWeights[epochIndexIterator] == nil) {
                        totalWeights[epochIndexIterator] = epochCommitment!
                    } else {
                        totalWeights[epochIndexIterator] = totalWeights[epochIndexIterator]! + epochCommitment!
                    }                    
                    epochIndexIterator = epochIndexIterator + 1
                }
            }
            return totalWeights
        }

        pub fun withdrawRewardTokens(delegatorId: UInt64): @FungibleToken.Vault {
            pre {
                !self.isISPOActive(): "ISPO must be inactive to withdraw reward tokens"
            }
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)!
            if (delegatorRef.hasWithdrawRewardToken) {
                return <- self.rewardTokenVault.withdraw(amount: 0.0)
            }
            let rewardAmount: UFix64 = self.getDelegatorRewardTokenAmount(delegatorRef: delegatorRef, epoch: self.epochEnd)
            delegatorRef.setHasWithrawnRewardToken()
            return <- self.rewardTokenVault.withdraw(amount: rewardAmount)
        }

        access(self) fun min(a: UInt64, b: UInt64): UInt64 {
            if a < b {
                return a
            }
            return b
        }

        access(self) fun getDelegatorRewardTokenAmount(
            delegatorRef: &ISPOManager.DelegatorRecord,
            epoch: UInt64
        ): UFix64 {
            let totalWeights: {UInt64: UFix64} = self.getTotalDelegatorWeights()
            let delegatorWeights: {UInt64: UFix64} = self.getDelegatorWeights(delegatorRef: delegatorRef)
            let totalRewardTokenAmountPerEpoch: UFix64 = self.rewardTokenMetadata.totalRewardTokenAmount / UFix64(self.epochEnd + 1 - self.epochStart)
            var rewardAmount: UFix64 = 0.0
            var epochIndexIterator: UInt64 = self.epochStart
            while (epochIndexIterator < self.min(a: self.epochEnd, b: epoch)) {
                rewardAmount = rewardAmount + (totalRewardTokenAmountPerEpoch * (delegatorWeights[epochIndexIterator]! / totalWeights[epochIndexIterator]!)) // TODO: remove division?
                epochIndexIterator = epochIndexIterator + 1
            }
            return rewardAmount
        }

        pub fun getRewardTokensBalance(delegatorId: UInt64, epoch: UInt64): UFix64 {
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)!
            if (delegatorRef.hasWithdrawRewardToken) {
                return 0.0
            }
            return self.getDelegatorRewardTokenAmount(delegatorRef: delegatorRef, epoch: epoch)
        }

        pub fun getDelegatedFlowBalance(delegatorId: UInt64): UFix64 {
            var res = 0.0
            let totalWeights: {UInt64: UFix64} = self.getTotalDelegatorWeights()
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)!
            let commitments = delegatorRef.getEpochFlowCommitments()

            for commitmentKey in commitments.keys {
                res = res + commitments[commitmentKey]!
            }

            return res
        }

        // this calculation relies on the reward distribution to be the same each epoch, e.g. same amount of FLOW
        // gets rewarded
        access(self) fun calculateAdminRewardAmount(delegatorRef: &ISPOManager.DelegatorRecord): UFix64 {
            let delegatorWeights: {UInt64: UFix64} = self.getDelegatorWeights(delegatorRef: delegatorRef)
            var totalWeightDuringISPO: UFix64 = 0.0
            var totalWeightAfterISPO: UFix64 = 0.0
            for key in delegatorWeights.keys {
                if (key <= self.epochEnd) {
                    totalWeightDuringISPO = totalWeightDuringISPO + delegatorWeights[key]!
                }
                totalWeightAfterISPO = totalWeightAfterISPO + delegatorWeights[key]!
            }
            let adminRewardCut: UFix64 = totalWeightDuringISPO / (totalWeightDuringISPO + totalWeightAfterISPO) // TODO avoid division? 
            let totalRewardsReceived: UFix64 = delegatorRef.getTotalRewardsReceived()
            return (totalRewardsReceived * adminRewardCut) - delegatorRef.withdrawnFlowTokenRewardAmount
        }

        pub fun withdrawAdminFlowRewards(): @FungibleToken.Vault {
            let stakingRewardsVaultRef: &FungibleToken.Vault = (&self.stakingRewardsVault as &FungibleToken.Vault?)!
            for key in self.delegators.keys {
                let delegatorRecordRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: key)!
                let adminRewardAmount: UFix64 = self.calculateAdminRewardAmount(delegatorRef: delegatorRecordRef)
                let delegatorRewardsVault: @FungibleToken.Vault <- delegatorRecordRef.withdrawRewards(amount: adminRewardAmount)
                stakingRewardsVaultRef.deposit(from: <- delegatorRewardsVault)
            }
            return <- stakingRewardsVaultRef.withdraw(amount: stakingRewardsVaultRef.balance)
        }
        
        // withdraws admin portion of delegator rewards to ISPO rewardsVault, and return NodeDelegator
        pub fun withdrawNodeDelegator(delegatorId: UInt64): @FlowIDTableStaking.NodeDelegator {
            // TODO: we could reuse withdrawAdminFlowRewards
            let delegatorRecordRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)!
            let adminRewardAmount: UFix64 = self.calculateAdminRewardAmount(delegatorRef: delegatorRecordRef)
            let rewardsVault: @FungibleToken.Vault <- delegatorRecordRef.withdrawRewards(amount: adminRewardAmount)
            let stakingRewardsVaultRef: &FungibleToken.Vault = (&self.stakingRewardsVault as &FungibleToken.Vault?)!
            stakingRewardsVaultRef.deposit(from: <- rewardsVault)
            return <- delegatorRecordRef.withdrawNodeDelegator()
        }

        // withdraws admin portion of delegator rewards to ISPO rewardsVault, and return NodeDelegator 
        pub fun hasNodeDelegator(delegatorId: UInt64): Bool {
            return self.borrowDelegatorRecord(delegatorId: delegatorId)!.hasNodeDelegator()
        }

        destroy() {
            pre {
                self.rewardTokenVault.balance == UFix64(0.0): "ISPO record still hold some reward token, so it cannot be destroyed"
                // TODO: add conditions for destroying stakingRewardsVault
            }
            destroy self.rewardTokenVault
            destroy self.delegators
            destroy self.stakingRewardsVault
        }
    }

    access(contract) let ispos: @{UInt64: ISPO}
    access(contract) let defaultNodeId: String

    access(contract) fun borrowISPORecord(id: UInt64): &ISPOManager.ISPO {
        pre {
            self.ispos.containsKey(id): "Specified ISPO record does not exist"
        }
        return (&self.ispos[id] as &ISPOManager.ISPO?)!
    }

    pub fun getISPORewardTokenMetadata(id: UInt64): ISPOManager.RewardTokenMetadata {
        return self.borrowISPORecord(id: id).rewardTokenMetadata
    }

    pub fun getISPOInfos(): [ISPOInfo] {
        let ispoInfos : [ISPOInfo] = [] 
        ISPOManager.ispos.forEachKey(fun (key: UInt64): Bool {
           let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: key)
           ispoInfos.append(ispoRef.getInfo())
           return true
        })
        return ispoInfos
    }

    access(contract) fun recordISPO(
        id: UInt64,
        name: String,
        projectUrl: String,
        projectDescription: String,
        logoUrl: String,
        delegatorNodeId: String,
        rewardTokenVault: @FungibleToken.Vault,
        rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
        epochStart: UInt64,
        epochEnd: UInt64,
        createdAt: UFix64,
    ) {
        pre {
            !self.ispos.containsKey(id): "Resource with same id already exists"
        }
        var tmpRecord: @ISPO? <- create ISPO(
            id: id,
            name: name,
            projectUrl: projectUrl,
            projectDescription: projectDescription,
            logoUrl: logoUrl,
            delegatorNodeId: delegatorNodeId,
            rewardTokenVault: <- rewardTokenVault,
            rewardTokenMetadata: rewardTokenMetadata,
            epochStart: epochStart,
            epochEnd: epochEnd,
            createdAt: createdAt,
        )
        self.ispos[id] <-> tmpRecord
        // we destroy this "tmpRecord" but at this point it must contain null as it was swapped with previous value of "ispoRecords[id]"
        // https://developers.flow.com/cadence/language/resources
        destroy tmpRecord
    }

    access(contract) fun removeISPORecord(id: UInt64) {
        pre {
            self.ispos.containsKey(id): "Cannot remove ISPO record that does not exist"
        }
        destroy self.ispos.remove(key: id)!
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
            name: String,
            projectUrl: String,
            projectDescription: String,
            logoUrl: String,
            delegatorNodeId: String,
            rewardTokenVault: @FungibleToken.Vault,
            rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
            epochStart: UInt64,
            epochEnd: UInt64,
        ) {
            ISPOManager.recordISPO(
                id: self.uuid,
                name: name,
                projectUrl: projectUrl,
                projectDescription: projectDescription,
                logoUrl: logoUrl,
                delegatorNodeId: delegatorNodeId,
                rewardTokenVault: <- rewardTokenVault,
                rewardTokenMetadata: rewardTokenMetadata,
                epochStart: epochStart,
                epochEnd: epochEnd,
                createdAt: getCurrentBlock().timestamp,
            )
        }

        pub fun withdrawRewards(): @FungibleToken.Vault {
            return <- ISPOManager.borrowISPORecord(id: self.uuid).withdrawAdminFlowRewards()
        }

        pub fun getIspoInfos(): [ISPOInfo] {
            return [ISPOManager.borrowISPORecord(id: self.uuid).getInfo()]
        }

        destroy() {
            ISPOManager.removeISPORecord(id: self.uuid)
        }
    }

    pub fun createISPOAdmin(
        name: String,
        projectUrl: String,
        projectDescription: String,
        logoUrl: String,
        delegatorNodeId: String,
        rewardTokenVault: @FungibleToken.Vault,
        rewardTokenMetadata: ISPOManager.RewardTokenMetadata,
        epochStart: UInt64,
        epochEnd: UInt64
    ): @ISPOAdmin {
        return <- create ISPOAdmin(
            name: name,
            projectUrl: projectUrl,
            projectDescription: projectDescription,
            logoUrl: logoUrl,
            delegatorNodeId: delegatorNodeId,
            rewardTokenVault: <- rewardTokenVault,
            rewardTokenMetadata: rewardTokenMetadata,
            epochStart: epochStart,
            epochEnd: epochEnd
        )
    }

    // ISPOClient

    pub let ispoClientStoragePath: StoragePath

    pub struct ISPOClientInfo {
        access(self) let ispoId: UInt64
        access(self) let delegatedFlowBalance: UFix64
        access(self) let rewardTokenBalance: UFix64
        access(self) let createdAt: UFix64

        init(
            ispoId: UInt64,
            delegatedFlowBalance: UFix64,
            rewardTokenBalance: UFix64,
            createdAt: UFix64,
        ) {
            self.ispoId = ispoId
            self.delegatedFlowBalance = delegatedFlowBalance
            self.rewardTokenBalance = rewardTokenBalance
            self.createdAt = createdAt
        }
    }

    pub resource ISPOClient {
        pub let ispoId: UInt64
        pub let createdAt: UFix64

        init(ispoId: UInt64, flowVault: @FungibleToken.Vault, createdAt: UFix64) {
            self.ispoId = ispoId
            self.createdAt = createdAt
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: ispoId)
            ispoRef.delegateNewTokens(delegatorId: self.uuid, flowVault: <- flowVault)
        }

        pub fun delegateNewTokens(flowVault: @FungibleToken.Vault) {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            ispoRef.delegateNewTokens(delegatorId: self.uuid, flowVault: <- flowVault)
        }

        pub fun withdrawNodeDelegator(): @FlowIDTableStaking.NodeDelegator {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            return <- ispoRef.withdrawNodeDelegator(delegatorId: self.uuid)
        }

        pub fun withdrawRewardTokens(): @FungibleToken.Vault {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            return <- ispoRef.withdrawRewardTokens(delegatorId: self.uuid)
        }

        pub fun getRewardTokenBalance(epoch: UInt64): UFix64 {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            return ispoRef.getRewardTokensBalance(delegatorId: self.uuid, epoch: epoch)
        }

        pub fun getDelegatedFlowBalance(): UFix64 {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            return ispoRef.getDelegatedFlowBalance(delegatorId: self.uuid)
        }

        pub fun getInfo(): ISPOClientInfo {
            return ISPOClientInfo(
                ispoId: self.ispoId,
                delegatedFlowBalance: self.getDelegatedFlowBalance(),
                rewardTokenBalance: self.getRewardTokenBalance(epoch: FlowEpochProxy.getCurrentEpoch()),
                createdAt: self.createdAt,
            )
        }

        pub fun hasDelegation(): Bool {
            return ISPOManager.borrowISPORecord(id: self.ispoId).hasNodeDelegator(delegatorId: self.uuid)
        }
        // TODO: destroy
    }

    pub fun createISPOClient(ispoId: UInt64, flowVault: @FungibleToken.Vault): @ISPOClient {
      return <- create ISPOClient(ispoId: ispoId, flowVault: <- flowVault, createdAt: getCurrentBlock().timestamp)
    }

    init() {
        self.ispos <- {}
        self.defaultNodeId = "26c1cd3254ec259b4faea0f53e3a446539256d81f0c06fff430690433d69731f"
        self.ispoAdminStoragePath = /storage/ISPOAdmin
        self.ispoClientStoragePath = /storage/ISPOClient
    }
}
 