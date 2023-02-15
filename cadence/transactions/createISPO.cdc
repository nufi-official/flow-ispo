import ISPOManager from "../contracts/ISPOManager.cdc"
import FungibleToken from "../contracts/standard/FungibleToken.cdc"

transaction(id: String, rewardTokenAmount: UFix64) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPO>(from: ISPOManager.ispoStoragePath) != nil {
      panic("ISPO already exists")
    }

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

    acct.save(
      <-ISPOManager.createISPO(id: id, rewardTokenVault: <- vaultRef.withdraw(amount: rewardTokenAmount)),
      to: ISPOManager.ispoStoragePath
    )

    acct.link<&ISPOManager.ISPO{ISPOManager.ISPOPublic}>(
        ISPOManager.ispoPublicPath,
        target: ISPOManager.ispoStoragePath
    )
  }

  execute {}
}
 