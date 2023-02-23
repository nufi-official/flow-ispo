import ISPOExampleRewardToken from  0xISPOExampleRewardToken
import FungibleToken from  0xFungibleToken

transaction(amount: UFix64) {
    prepare(adminAccount: AuthAccount) {
      let vault <- ISPOExampleRewardToken.createEmptyVault()
      adminAccount.save(<-vault, to: /storage/ispoExampleRewardTokenVault)

        // Create a public capability to the stored Vault that only exposes
        // the `deposit` method through the `Receiver` interface
        //
      adminAccount.link<&ISPOExampleRewardToken.Vault{FungibleToken.Receiver}>(
          /public/ispoExampleRewardTokenReceiver,
          target: /storage/ispoExampleRewardTokenVault
      )

      // Create a public capability to the stored Vault that only exposes
      // the `balance` field through the `Balance` interface
      //
      adminAccount.link<&ISPOExampleRewardToken.Vault{FungibleToken.Balance}>(
          /public/ispoExampleRewardTokenBalance,
          target: /storage/ispoExampleRewardTokenVault
      )

      let admin <- ISPOExampleRewardToken.createAdminResource()
      

      let adminRef = &admin as &ISPOExampleRewardToken.Administrator
      let minterRef = &adminRef.createNewMinter(allowedAmount: amount) as &ISPOExampleRewardToken.Minter?
      let mintedVault <- minterRef!.mintTokens(amount: amount)
      let vaultRef = adminAccount.borrow<&ISPOExampleRewardToken.Vault>(from: /storage/ispoExampleRewardTokenVault)!
      adminAccount.save(<-admin, to: /storage/ispoExampleRewardTokenAdmin)
      vaultRef.deposit(from: <- mintedVault)
    }   
}
