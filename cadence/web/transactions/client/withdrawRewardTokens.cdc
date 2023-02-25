import ISPOManager from 0xISPOManager
import FungibleToken from 0xFungibleToken

transaction(ispoClientId: UInt64) {

  prepare(acct: AuthAccount) {
    let ispoClientsRef: &{UInt64: ISPOManager.ISPOClient} = acct.borrow<&{UInt64: ISPOManager.ISPOClient}>(from: ISPOManager.ispoClientStoragePath)!

    let ispoClientRef = &ispoClientsRef[ispoClientId] as &ISPOManager.ISPOClient?
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
