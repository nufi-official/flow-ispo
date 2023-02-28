import FungibleToken from "../contracts/standard/FungibleToken.cdc"
import ISPOExampleRewardToken from  0xf8d6e0586b0a20c7

pub fun main(address: Address): UFix64 {
    let account: PublicAccount = getAccount(address)
    let vaultRef = account.getCapability<&ISPOExampleRewardToken.Vault{FungibleToken.Balance}>(/public/rewardTokenBalance)

    if (vaultRef == nil || vaultRef.borrow() == nil || !vaultRef.check()) {
      return 0.0
    }

    return vaultRef.borrow()!.balance
}
 