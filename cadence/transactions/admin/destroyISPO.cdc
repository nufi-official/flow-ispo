import ISPOManager from "../../contracts/ISPOManager.cdc"

transaction() {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath) != nil {
      destroy acct.load<@ISPOManager.ISPOAdmin>(from: ISPOManager.ispoAdminStoragePath)
    }
  }

  execute {}
}