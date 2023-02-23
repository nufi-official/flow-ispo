import ISPOManager from "../../contracts/ISPOManager.cdc"
import FungibleToken from "../../contracts/standard/FungibleToken.cdc"

transaction(ispoId: UInt64, amount: UFix64) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOClient>(from: ISPOManager.ispoClientStoragePath) == nil {
      let ispoClientsRes: @{UInt64: ISPOManager.ISPOClient} <- {}
      acct.save(
        <-ispoClientsRes,
        to: ISPOManager.ispoClientStoragePath
      )
    }

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
  
    let newIspo <-ISPOManager.createISPOClient(ispoId: ispoId, flowVault: <- vaultRef.withdraw(amount: amount))
    let ispoClientsRes: &{UInt64: ISPOManager.ISPOClient} = acct.borrow<&{UInt64: ISPOManager.ISPOClient}>(from: ISPOManager.ispoClientStoragePath)!
    ispoClientsRes[newIspo.uuid] <-! newIspo
  }

  execute {}
}
