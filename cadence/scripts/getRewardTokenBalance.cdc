import FungibleToken from "../contracts/standard/FungibleToken.cdc"
import ISPOExampleRewardToken from  "../contracts/ISPOExampleRewardToken.cdc"

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let vaultRef = account.getCapability<&ISPOExampleRewardToken.Vault{FungibleToken.Balance}>(/public/ispoExampleRewardTokenBalance)

    if (!vaultRef.check()) {
      panic("Could not borrow Balance reference to the Vault")
    }

    return vaultRef.borrow()!.balance
}