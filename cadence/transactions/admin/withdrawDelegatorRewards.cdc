import ISPOManager from "../../contracts/ISPOManager.cdc"
import FungibleToken from "../../contracts/standard/FungibleToken.cdc"

transaction() {

  prepare(acct: AuthAccount) {

    let ispoAdminRef: &ISPOManager.ISPOAdmin? = acct.borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath)
    if (ispoAdminRef == nil) {
      panic("ISPO does not exist")
    }
    let delegatorRewardsVault: @FungibleToken.Vault <- ispoAdminRef!.withdrawDelegatorRewards()

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

    vaultRef.deposit(from: <- delegatorRewardsVault)
  }

  execute {}
}
 