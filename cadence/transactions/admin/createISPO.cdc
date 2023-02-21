import ISPOManager from "../../contracts/ISPOManager.cdc"
import FungibleToken from "../../contracts/standard/FungibleToken.cdc"

transaction(
<<<<<<< HEAD
  ispoName: String,
=======
>>>>>>> master
  epochStart: UInt64,
  epochEnd: UInt64,
  rewardTokenVaultStoragePath: String,
  rewardTokenReceiverPublicPath: String,
  rewardTokenBalancePublicPath: String,
  totalRewardTokenAmount: UFix64
) {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath) != nil {
      panic("ISPO already exists")
    }

<<<<<<< HEAD
    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: StoragePath(identifier: rewardTokenVaultStoragePath)!)
=======
    let vaultRef: &FungibleToken.Vault = acct.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)
>>>>>>> master
			?? panic("Could not borrow reference to the owner's Vault!")

    let rewardTokenMetadata: ISPOManager.RewardTokenMetadata = ISPOManager.RewardTokenMetadata(
      rewardTokenVaultStoragePath: StoragePath(identifier: rewardTokenVaultStoragePath)!,
      rewardTokenReceiverPublicPath: PublicPath(identifier: rewardTokenReceiverPublicPath)!,
      rewardTokenBalancePublicPath: PublicPath(identifier: rewardTokenBalancePublicPath)!,
      totalRewardTokenAmount: totalRewardTokenAmount
    )

    acct.save(
      <-ISPOManager.createISPOAdmin(
<<<<<<< HEAD
        name: ispoName,
=======
>>>>>>> master
        rewardTokenVault: <- vaultRef.withdraw(amount: totalRewardTokenAmount),
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
 