import ISPOManager from "../../contracts/ISPOManager.cdc"
import FungibleToken from "../../contracts/standard/FungibleToken.cdc"
import FlowToken from "../../contracts/standard/FlowToken.cdc"
import FlowIDTableStaking from "../../contracts/standard/FlowIDTableStaking.cdc"
import FlowStakingCollection from "../../contracts/standard/FlowStakingCollection.cdc"
import LockedTokens from "../../contracts/standard/LockedTokens.cdc"

transaction() {

  prepare(acct: AuthAccount) {

    if acct.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath) == nil {

    // Create private capabilities for the token holder and unlocked vault
    let lockedHolder = acct.link<&LockedTokens.TokenHolder>(/private/flowTokenHolder, target: LockedTokens.TokenHolderStoragePath)!
    let flowToken = acct.link<&FlowToken.Vault>(/private/flowTokenVault, target: /storage/flowTokenVault)!
    
    // Create a new Staking Collection and put it in storage
    if lockedHolder.check() {
        acct.save(<-FlowStakingCollection.createStakingCollection(unlockedVault: flowToken, tokenHolder: lockedHolder), to: FlowStakingCollection.StakingCollectionStoragePath)
    } else {
        acct.save(<-FlowStakingCollection.createStakingCollection(unlockedVault: flowToken, tokenHolder: nil), to: FlowStakingCollection.StakingCollectionStoragePath)
    }

      // Create a public link to the staking collection
      acct.link<&FlowStakingCollection.StakingCollection{FlowStakingCollection.StakingCollectionPublic}>(
          FlowStakingCollection.StakingCollectionPublicPath,
          target: FlowStakingCollection.StakingCollectionStoragePath
      )
    }

    let stakingCollectionRef = acct.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
      ?? panic("Could not borrow ref to StakingCollection")

    let ispoClientRef: &ISPOManager.ISPOClient? = acct.borrow<&ISPOManager.ISPOClient>(from: ISPOManager.ispoClientStoragePath)
    if (ispoClientRef == nil) {
      panic("ISPO client does not exist")
    }
    let delegator: @FlowIDTableStaking.NodeDelegator <- ispoClientRef!.withdrawNodeDelegator()

    stakingCollectionRef.addDelegatorObject(<- delegator)
  }

  execute {}
}
 