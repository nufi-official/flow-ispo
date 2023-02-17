import ISPOManager from "../contracts/ISPOManager.cdc"
import FungibleToken from "../contracts/standard/FungibleToken.cdc"

transaction() {

  prepare(acct: AuthAccount) {
    let ispoClientRef: &ISPOManager.ISPOClient? = acct.borrow<&ISPOManager.ISPOClient>(from: ISPOManager.ispoClientStoragePath)
    if (ispoClientRef == nil) {
      panic("ISPO client does not exist")
    }

    let ispoRewardTokens: @FungibleToken.Vault <- ispoClientRef!.withdrawRewardTokens()

    let ispoRewardTokenMetadata: ISPOManager.RewardTokenMetadata = ISPOManager.getISPORewardTokenMetadata(id: ispoClientRef!.ispoId)
    let rewardTokenVaultRef: &FungibleToken.Vault? = acct.borrow<&FungibleToken.Vault>(from: ispoRewardTokenMetadata.rewardTokenVaultStoragePath)
    if (rewardTokenVaultRef == nil) {
      acct.save(
        <-ispoRewardTokens,
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
    } else {
      rewardTokenVaultRef!.deposit(from: <- ispoRewardTokens)
    }
  }

  execute {}
}
 