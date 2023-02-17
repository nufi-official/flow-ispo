import ISPOManager from "../contracts/ISPOManager.cdc"
import FungibleToken from "../contracts/standard/FungibleToken.cdc"

transaction(ispoId: UInt64, amount: UFix64) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOClient>(from: ISPOManager.ispoClientStoragePath) != nil {
      panic("ISPO already exists")
    }

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
  
    acct.save(
      <-ISPOManager.createISPOClient(ispoId: ispoId, flowVault: <- vaultRef.withdraw(amount: amount)),
      to: ISPOManager.ispoClientStoragePath
    )
  }

  execute {}
}
 