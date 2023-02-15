import ISPOManager from "../contracts/ISPOManager.cdc"
import FungibleToken from "../contracts/standard/FungibleToken.cdc"

transaction(id: String, rewardTokenAmount: UFix64) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath) != nil {
      panic("ISPO already exists")
    }

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

    acct.save(
      <-ISPOManager.createISPOAdmin(id: id, rewardTokenVault: <- vaultRef.withdraw(amount: rewardTokenAmount)),
      to: ISPOManager.ispoAdminStoragePath
    )
  }

  execute {}
}
 