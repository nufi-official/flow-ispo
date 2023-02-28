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
        access(self) let epochFlowCommitments: {UInt64: Fix64}
        pub var withdrawnFlowTokenRewardAmount: UFix64
        pub var hasWithdrawRewardToken: Bool
        pub let firstCommitmentEpoch: UInt64

        init(nodeDelegator: @FlowIDTableStaking.NodeDelegator) {
            self.nodeDelegator <- nodeDelegator
            self.epochFlowCommitments = {}
            self.hasWithdrawRewardToken = false
            self.withdrawnFlowTokenRewardAmount = 0.0
            self.firstCommitmentEpoch = FlowEpochProxy.getCurrentEpoch()
        }

        access(self) fun updateCurrentEpochFlowCommitment(amount: Fix64) {
            let currentEpoch: UInt64 = FlowEpochProxy.getCurrentEpoch()
            if (self.epochFlowCommitments.containsKey(currentEpoch)) {
                let currentEpochCommitment: Fix64 = self.epochFlowCommitments[currentEpoch]!
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
            self.updateCurrentEpochFlowCommitment(amount: Fix64(amount))
        }

        pub fun getEpochFlowCommitments(): {UInt64: Fix64} {
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
        pub fun getNodeDelegatorRewardAmount(): UFix64 {
            let nodeDelegatorRef: &FlowIDTableStaking.NodeDelegator? = self.borrowNodeDelegator()
            if (nodeDelegatorRef == nil) {
                return 0.0
            }
            return FlowIDTableStaking.DelegatorInfo(nodeID: nodeDelegatorRef!.nodeID, delegatorID: nodeDelegatorRef!.id).tokensRewarded
        }

        pub fun withdrawNodeDelegator(): @FlowIDTableStaking.NodeDelegator {
            pre {
                self.borrowNodeDelegator() != nil: "Delegator has already been moved"
            }
            let nodeDelegatorRef: &FlowIDTableStaking.NodeDelegator = self.borrowNodeDelegator()!
            let delegatorInfo: FlowIDTableStaking.DelegatorInfo = FlowIDTableStaking.DelegatorInfo(nodeID: nodeDelegatorRef.nodeID, delegatorID: nodeDelegatorRef.id)
            // current commitment has to be reset to 0
            self.updateCurrentEpochFlowCommitment(amount: 0.0)
            // from the previous commitment, currently staked value has to be subtracted, as if the delegator requested to unstake everything the previous epoch
            let previousEpochCommitment: Fix64 = self.epochFlowCommitments[FlowEpochProxy.getCurrentEpoch() - 1] ?? 0.0
            self.epochFlowCommitments[FlowEpochProxy.getCurrentEpoch() - 1] = previousEpochCommitment - Fix64(delegatorInfo.tokensStaked)
            
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
            pre {
                // === 0 for emulator testing
                FlowIDTableStaking.getProposedNodeIDs().length == 0 || FlowIDTableStaking.getProposedNodeIDs().contains(delegatorNodeId): "Node id is not in the proposed list",
            }
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
            return currentEpoch <= self.epochEnd
        }

        access(self) fun borrowDelegatorRecord(delegatorId: UInt64): &DelegatorRecord {
            pre {
                self.delegators.containsKey(delegatorId): "Delegator record does not exist"
            }
            return (&self.delegators[delegatorId] as &DelegatorRecord?)!
        }

        pub fun delegateNewTokens(delegatorId: UInt64, flowVault: @FungibleToken.Vault) {
            pre {
                self.isISPOActive(): "ISPO is not active"
            }

            if (self.delegators.containsKey(delegatorId)) {
                self.borrowDelegatorRecord(delegatorId: delegatorId).delegateNewTokens(flowVault: <- flowVault)
            } else {
                let nodeId: String = self.delegatorNodeId
                let nodeDelegator: @FlowIDTableStaking.NodeDelegator <- FlowIDTableStaking.registerNewDelegator(nodeID: nodeId) 

                let newDelegatorRecord: @ISPOManager.DelegatorRecord <- create DelegatorRecord(nodeDelegator: <- nodeDelegator)
                newDelegatorRecord.delegateNewTokens(flowVault: <- flowVault)
                self.delegators[delegatorId] <-! newDelegatorRecord
            }
        }

        // returns how much delegator "had staked" for each epoch, weights always include the current epoch
        access(self) fun getCurrentDelegatorWeights(delegatorRef: &ISPOManager.DelegatorRecord): {UInt64: UFix64} {
            let epochFlowCommitments: {UInt64: Fix64} = delegatorRef.getEpochFlowCommitments()
            if (epochFlowCommitments.keys.length == 0) {
                return {}
            }

            var weights: {UInt64: UFix64} = {}
            // we start at least one epoch before ISPO start so we capture tokens commited before it
            // in case client delegated before the ISPO, we calculate weights from that epoch
            var epochIndexIterator: UInt64 = ISPOManager.min(a: self.epochStart - 1, b: delegatorRef.firstCommitmentEpoch)

            var lastCommitedValue: UFix64 = 0.0
            // iterate commits only until the previous epoch, since current epoch commitment is not finalized yet
            while (epochIndexIterator < FlowEpochProxy.getCurrentEpoch()) {
                let epochCommitment: Fix64? = epochFlowCommitments[epochIndexIterator]
                if (epochCommitment != nil) {
                    lastCommitedValue = UFix64(Fix64(lastCommitedValue) + epochCommitment!)
                }
                // we put the lastCommitedValue one epoch further, since at that point that amount of FLOW is staked
                weights[epochIndexIterator + 1] = lastCommitedValue
                epochIndexIterator = epochIndexIterator + 1
            }
            return weights
        }

        // sums all delegator weighs by epoch, from startEpoch to currentEpoch
        access(self) fun getTotalDelegatorWeights(): {UInt64: UFix64} {
            var totalWeights: {UInt64: UFix64} = {}
            for delegatorId in self.delegators.keys {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
                let delegatorEpochWeights: {UInt64: UFix64} = self.getCurrentDelegatorWeights(delegatorRef: delegatorRef)

                for epochNumber in delegatorEpochWeights.keys {
                    let epochWeight: UFix64? = delegatorEpochWeights[epochNumber]!
                    if (totalWeights[epochNumber] == nil) {
                        totalWeights[epochNumber] = epochWeight!
                    } else {
                        totalWeights[epochNumber] = totalWeights[epochNumber]! + epochWeight!
                    }                    
                }
            }
            return totalWeights
        }

        // gets reward token amount which a clientISPO currently deserves (not inluding current epoch)
        access(self) fun calculateClientRewardTokenAmount(
            delegatorRef: &ISPOManager.DelegatorRecord,
        ): UFix64 {
            let totalWeights: {UInt64: UFix64} = self.getTotalDelegatorWeights()
            let delegatorWeights: {UInt64: UFix64} = self.getCurrentDelegatorWeights(delegatorRef: delegatorRef)
            let totalRewardTokenAmountPerEpoch: UFix64 = self.rewardTokenMetadata.totalRewardTokenAmount / UFix64(self.epochEnd + 1 - self.epochStart)
            var rewardAmount: UFix64 = 0.0
            // rewards for ISPO are available one epoch after start, and distributed at last, one epoch after ISPO
            var epochIndexIterator: UInt64 = self.epochStart
            while (epochIndexIterator <= ISPOManager.min(a: self.epochEnd, b: FlowEpochProxy.getCurrentEpoch() - 1)) {
                let totalWeightForEpoch: UFix64? = totalWeights[epochIndexIterator]
                let delegatorEpochWeight: UFix64? = delegatorWeights[epochIndexIterator]
                epochIndexIterator = epochIndexIterator + 1
                // in case there are no weights for this epoch, or the total weight is 0, no reward tokens are rewarded
                if (totalWeightForEpoch == nil || delegatorEpochWeight == nil || totalWeightForEpoch == 0.0) {
                    continue
                }
                let epochDelegatorWeightRatio: UFix64 = delegatorEpochWeight! / totalWeightForEpoch!
                rewardAmount = rewardAmount + (totalRewardTokenAmountPerEpoch * epochDelegatorWeightRatio)
            }
            return rewardAmount
        }

        // withdraws client reward tokens
        pub fun withdrawRewardTokens(delegatorId: UInt64): @FungibleToken.Vault {
            pre {
                !self.isISPOActive(): "ISPO must be inactive to withdraw reward tokens"
            }
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
            if (delegatorRef.hasWithdrawRewardToken) {
                return <- self.rewardTokenVault.withdraw(amount: 0.0)
            }
            let rewardAmount: UFix64 = self.calculateClientRewardTokenAmount(delegatorRef: delegatorRef)
            delegatorRef.setHasWithrawnRewardToken()
            return <- self.rewardTokenVault.withdraw(amount: rewardAmount)
        }

        // this calculation relies on the reward distribution to be the same each epoch, e.g. same amount of FLOW
        // gets rewarded every epoch
        access(self) fun calculateAdminRewardAmount(delegatorRef: &ISPOManager.DelegatorRecord): UFix64 {
            pre {
                delegatorRef.hasNodeDelegator(): "Cannot calculate admin rewards from removed node delegator"
            }
            let delegatorWeights: {UInt64: UFix64} = self.getCurrentDelegatorWeights(delegatorRef: delegatorRef)
            var totalWeightDuringISPO: UFix64 = 0.0
            var totalWeightOutsideISPO: UFix64 = 0.0
            for epoch in delegatorWeights.keys {
                // first epoch, no reward tokens are given, so rewards from this epoch still belong to delegator
                if (epoch >= self.epochStart && epoch <= ISPOManager.min(a: self.epochEnd, b: FlowEpochProxy.getCurrentEpoch() - 1)) {
                    totalWeightDuringISPO = totalWeightDuringISPO + delegatorWeights[epoch]!
                } else {
                    totalWeightOutsideISPO = totalWeightOutsideISPO + delegatorWeights[epoch]!
                }
            }

            let totalWeight: UFix64 = totalWeightDuringISPO + totalWeightOutsideISPO
            // if no funds were delegated during ISPO
            if (totalWeight == 0.0) {
                return 0.0
            }

            let adminRewardRatio: UFix64 = totalWeightDuringISPO / totalWeight
            let nodeDelegatorRewardAmount: UFix64 = delegatorRef.getNodeDelegatorRewardAmount()
            let totalRewardsReceived: UFix64 = nodeDelegatorRewardAmount + delegatorRef.withdrawnFlowTokenRewardAmount
            let adminRewards: UFix64 = (totalRewardsReceived * adminRewardRatio) - delegatorRef.withdrawnFlowTokenRewardAmount
            // it might happen that what we calculate the admins portion is a bit bigger than what the delegator actually has
            // due to differences between rewards distributed each epoch, in this case we return as much as the delegator has
            if (adminRewards > nodeDelegatorRewardAmount) {
                return nodeDelegatorRewardAmount
            }
            return adminRewards
        }

        // gets only those delegator ids, which have not withdrawn their node delegator yet
        access(self) fun getActiveDelegatorIds(): [UInt64] {
            var ids: [UInt64] = []
            for delegatorId in self.delegators.keys {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
                if (delegatorRef.hasNodeDelegator()) {
                    ids.append(delegatorId)
                }
            }
            return ids
        }

        access(self) fun borrowStakingRewardsVault(): &FungibleToken.Vault  {
            return (&self.stakingRewardsVault as &FungibleToken.Vault?)!
        }

        access(self) fun moveAdminFlowRewardsFromDelegator(delegatorRef: &ISPOManager.DelegatorRecord) {
            let adminRewardAmount: UFix64 = self.calculateAdminRewardAmount(delegatorRef: delegatorRef)
            let delegatorRewardsVault: @FungibleToken.Vault <- delegatorRef.withdrawRewards(amount: adminRewardAmount)
            self.borrowStakingRewardsVault().deposit(from: <- delegatorRewardsVault)
        }

        pub fun withdrawAllAdminFlowRewards(): @FungibleToken.Vault {
            let stakingRewardsVaultRef: &FungibleToken.Vault = self.borrowStakingRewardsVault()
            for delegatorId in self.getActiveDelegatorIds() {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
                self.moveAdminFlowRewardsFromDelegator(delegatorRef: delegatorRef)
            }
            return <- stakingRewardsVaultRef.withdraw(amount: stakingRewardsVaultRef.balance)
        }
        
        // withdraws admin portion of delegator rewards to ISPO rewardsVault, and return NodeDelegator
        pub fun withdrawNodeDelegator(delegatorId: UInt64): @FlowIDTableStaking.NodeDelegator {
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
            // move flow rewards from this delegator to admin vault
            self.moveAdminFlowRewardsFromDelegator(delegatorRef: delegatorRef)
            return <- delegatorRef.withdrawNodeDelegator()
        }

        pub fun hasNodeDelegator(delegatorId: UInt64): Bool {
            return self.borrowDelegatorRecord(delegatorId: delegatorId).hasNodeDelegator()
        }

        // sums all delegated flow
        access(self) fun getTotalDelegatedFlowBalance(): UFix64 {
            var delegatedAmount: Fix64 = 0.0
            for delegatorId in self.getActiveDelegatorIds() {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
                let commitments: {UInt64: Fix64} = delegatorRef.getEpochFlowCommitments()
                for commitmentKey in commitments.keys {
                    delegatedAmount = delegatedAmount + commitments[commitmentKey]!
                }
            }
            return UFix64(delegatedAmount)
        }

        pub fun getRewardTokensBalance(delegatorId: UInt64): UFix64 {
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
            if (delegatorRef.hasWithdrawRewardToken) {
                return 0.0
            }
            return self.calculateClientRewardTokenAmount(delegatorRef: delegatorRef)
        }

        pub fun getDelegatedFlowBalance(delegatorId: UInt64): UFix64 {
            var delegatedAmount: Fix64 = 0.0
            let totalWeights: {UInt64: UFix64} = self.getTotalDelegatorWeights()
            let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
            let commitments: {UInt64: Fix64} = delegatorRef.getEpochFlowCommitments()

            for epoch in commitments.keys {
                delegatedAmount = delegatedAmount + commitments[epoch]!
            }
            return UFix64(delegatedAmount)
        }

        // sums all delegated available flow rewards
        access(self) fun getTotalFlowRewardsBalance(): UFix64 {
            var rewardAmount: UFix64 = self.borrowStakingRewardsVault().balance
            for delegatorId in self.getActiveDelegatorIds() {
                let delegatorRef: &ISPOManager.DelegatorRecord = self.borrowDelegatorRecord(delegatorId: delegatorId)
                let adminRewardAmount: UFix64 = self.calculateAdminRewardAmount(delegatorRef: delegatorRef)
                rewardAmount = rewardAmount + adminRewardAmount
            }
            return rewardAmount
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
                delegationsCount: self.delegators.keys.length,
                delegatedFlowBalance: self.getTotalDelegatedFlowBalance(),
                flowRewardsBalance: self.getTotalFlowRewardsBalance(),
                createdAt: self.createdAt,
            )
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
            return <- ISPOManager.borrowISPORecord(id: self.uuid).withdrawAllAdminFlowRewards()
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

        pub fun getRewardTokenBalance(): UFix64 {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            return ispoRef.getRewardTokensBalance(delegatorId: self.uuid)
        }

        pub fun getDelegatedFlowBalance(): UFix64 {
            let ispoRef: &ISPOManager.ISPO = ISPOManager.borrowISPORecord(id: self.ispoId)
            return ispoRef.getDelegatedFlowBalance(delegatorId: self.uuid)
        }

        pub fun getInfo(): ISPOClientInfo {
            return ISPOClientInfo(
                ispoId: self.ispoId,
                delegatedFlowBalance: self.getDelegatedFlowBalance(),
                // - 1 epoch because the rewards for the current epoch are not yet finalized
                rewardTokenBalance: self.getRewardTokenBalance(),
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

    access(self) fun min(a: UInt64, b: UInt64): UInt64 {
        if a < b {
            return a
        }
        return b
    }

    access(self) fun max(a: UInt64, b: UInt64): UInt64 {
        if a > b {
            return a
        }
        return b
    }

    init() {
        self.ispos <- {}
        self.defaultNodeId = "26c1cd3254ec259b4faea0f53e3a446539256d81f0c06fff430690433d69731f"
        self.ispoAdminStoragePath = /storage/ISPOAdmin
        self.ispoClientStoragePath = /storage/ISPOClient
    }
}
 