import ISPOManager from 0xISPOManager
import FungibleToken from 0xFungibleToken
import ISPOExampleRewardToken from  0xISPOExampleRewardToken

transaction(
  ispoName: String,
  projectUrl: String,
  projectDescription: String,
  logoUrl: String,
  delegatorNodeId: String,
  epochStart: UInt64,
  epochEnd: UInt64,
  rewardTokenContractName: String,
  rewardTokenVaultStoragePath: String,
  rewardTokenReceiverPublicPath: String,
  rewardTokenBalancePublicPath: String,
  totalRewardTokenAmount: UFix64
) {

  prepare(acct: AuthAccount) {
    // mint reward token
    var oldTokenVault <- acct.load<@FungibleToken.Vault>(from: StoragePath(identifier: rewardTokenVaultStoragePath)!)
    destroy oldTokenVault // this destroys any leftover tokens from other potential deployments of the contract
    
    acct.save(<-ISPOExampleRewardToken.createEmptyVault(), to: StoragePath(identifier: rewardTokenVaultStoragePath)!)

    // Create a public capability to the stored Vault that only exposes
    // the `deposit` method through the `Receiver` interface
    //
    acct.link<&ISPOExampleRewardToken.Vault{FungibleToken.Receiver}>(
        PublicPath(identifier: rewardTokenReceiverPublicPath)!,
        target: StoragePath(identifier: rewardTokenVaultStoragePath)!
    )

    // Create a public capability to the stored Vault that only exposes
    // the `balance` field through the `Balance` interface
    //
    acct.link<&ISPOExampleRewardToken.Vault{FungibleToken.Balance}>(
        PublicPath(identifier: rewardTokenBalancePublicPath)!,
        target: StoragePath(identifier: rewardTokenVaultStoragePath)!
    )

    let admin <- ISPOExampleRewardToken.createAdminResource()
    

    let adminRef = &admin as &ISPOExampleRewardToken.Administrator
    let minterRef = &adminRef.createNewMinter(allowedAmount: totalRewardTokenAmount) as &ISPOExampleRewardToken.Minter?
    let mintedVault <- minterRef!.mintTokens(amount: totalRewardTokenAmount)
    let vaultRef = acct.borrow<&ISPOExampleRewardToken.Vault>(from: StoragePath(identifier: rewardTokenVaultStoragePath)!)!
    destroy admin
    vaultRef.deposit(from: <- mintedVault)

    // create ISPO
    if acct.borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath) != nil {
      panic("ISPO already exists")
    }

    let rewardTokenMetadata: ISPOManager.RewardTokenMetadata = ISPOManager.RewardTokenMetadata(
      rewardTokenContractName: rewardTokenContractName,
      rewardTokenVaultStoragePath: StoragePath(identifier: rewardTokenVaultStoragePath)!,
      rewardTokenReceiverPublicPath: PublicPath(identifier: rewardTokenReceiverPublicPath)!,
      rewardTokenBalancePublicPath: PublicPath(identifier: rewardTokenBalancePublicPath)!,
      totalRewardTokenAmount: totalRewardTokenAmount
    )

    acct.save(
      <-ISPOManager.createISPOAdmin(
        name: ispoName,
        projectUrl: projectUrl,
        projectDescription: projectDescription,
        logoUrl: logoUrl,
        delegatorNodeId: delegatorNodeId,
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
