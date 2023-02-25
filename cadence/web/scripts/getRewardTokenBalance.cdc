import FungibleToken from 0xFungibleToken
import ISPOExampleRewardToken from  0xISPOExampleRewardToken

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let vaultRef = account.getCapability<&ISPOExampleRewardToken.Vault{FungibleToken.Balance}>(/public/ispoExampleRewardTokenBalance)

    if (vaultRef == nil || !vaultRef.check()) {
      0.0
    }

    return vaultRef.borrow()!.balance
}