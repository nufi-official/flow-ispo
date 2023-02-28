import FungibleToken from 0xFungibleToken

pub fun main(address: Address, balancePublicPath: String): UFix64 {
    let account = getAccount(address)
    let vaultRef = account.getCapability<&{FungibleToken.Balance}>(PublicPath(identifier: balancePublicPath)!)

    if (vaultRef == nil || vaultRef.borrow() == nil || !vaultRef.check()) {
      return 0.0
    }

    return vaultRef.borrow()!.balance
}
