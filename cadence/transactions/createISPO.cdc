import ISPOManager from "../contracts/ISPOManager.cdc"
import FungibleToken from "../contracts/standard/FungibleToken.cdc"

transaction(rewardTokenAmount: UFix64, epochStart: UInt64, epochEnd: UInt64) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath) != nil {
      panic("ISPO already exists")
    }

    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")

    let rewardTokenMetadata: ISPOManager.RewardTokenMetadata = ISPOManager.RewardTokenMetadata(
      rewardTokenVaultStoragePath: /storage/rewardToken, // TODO: pass these in the transaction
      rewardTokenReceiverPublicPath: /public/rewardTokenReceiver,
      rewardTokenBalancePublicPath: /public/rewardTokenReceiver,
      totalRewardTokenAmount: vaultRef.balance
    )

    acct.save(
      <-ISPOManager.createISPOAdmin(
        rewardTokenVault: <- vaultRef.withdraw(amount: rewardTokenAmount),
        rewardTokenMetadata: rewardTokenMetadata,
        epochStart: epochStart,
        epochEnd: epochEnd,
      ),
      to: ISPOManager.ispoAdminStoragePath
    )
  }

  execute {}
}

// TODO: this should be a script template, the ISPO admin will have to provide (contractName, contractAddress, storageVaultPath)
 