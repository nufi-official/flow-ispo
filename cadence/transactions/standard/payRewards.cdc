import FlowIDTableStaking from 0x01cf0e2f2f715450
import FlowToken from "../../contracts/standard/FlowToken.cdc"
import FungibleToken from "../../contracts/standard/FungibleToken.cdc"

// This transaction pays rewards to all the staked nodes

transaction {

    // Local variable for a reference to the ID Table Admin object
    let adminRef: &FlowIDTableStaking.Admin
    let vaultRef: &FungibleToken.Vault

    prepare(acct: AuthAccount) {
        // borrow a reference to the admin object
        self.adminRef = acct.borrow<&FlowIDTableStaking.Admin>(from: FlowIDTableStaking.StakingAdminStoragePath)
            ?? panic("Could not borrow reference to staking admin")
        self.vaultRef = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)!
    }

    execute {
        let summary = self.adminRef.calculateRewards()
        let rewardsVault: @FungibleToken.Vault <- self.vaultRef.withdraw(amount: self.vaultRef.balance)
        let leftOverFlow: @FungibleToken.Vault <- self.adminRef.payRewards(summary, flowVault: <- rewardsVault)
        self.vaultRef.deposit(from: <- leftOverFlow)
    }
}
 