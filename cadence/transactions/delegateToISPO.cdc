import ISPOManager from "../contracts/ISPOManager.cdc"
import FungibleToken from "../contracts/standard/FungibleToken.cdc"

transaction(ispoId: UInt64, amount: UFix64) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOClient>(from: ISPOManager.ispoClientStoragePath) != nil {
      panic("ISPO already exists")
    }

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

    let ispoClient: @ISPOManager.ISPOClient <- ISPOManager.createISPOClient(ispoId: ispoId, flowVault: <- vaultRef.withdraw(amount: amount))

    let ispoRewardTokenMetadata: ISPOManager.RewardTokenMetadata = ISPOManager.getISPORewardTokenMetadata(id: ispoId)
    let rewardTokenVaultRef: &FungibleToken.Vault? = acct.borrow<&FungibleToken.Vault>(from: ispoRewardTokenMetadata.rewardTokenVaultStoragePath)
    if (rewardTokenVaultRef == nil) {
      let rewardTokenVault: @FungibleToken.Vault <- ispoClient.createEmptyRewardTokenVault()
      acct.save(
        <-rewardTokenVault,
        to: ispoRewardTokenMetadata.rewardTokenVaultStoragePath
      )

      acct.link<&{FungibleToken.Balance}>(
        ispoRewardTokenMetadata.rewardTokenBalancePublicPath,
        target: ispoRewardTokenMetadata.rewardTokenVaultStoragePath
      )
      acct.link<&{FungibleToken.Receiver}>(
        ispoRewardTokenMetadata.rewardTokenReceiverPublicPath,
        target: ispoRewardTokenMetadata.rewardTokenVaultStoragePath
      )
    }

    acct.save(
      <-ispoClient,
      to: ISPOManager.ispoClientStoragePath
    )
  }

  execute {}
}
 