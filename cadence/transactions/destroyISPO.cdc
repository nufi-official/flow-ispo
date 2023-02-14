import ISPOManager from "../contracts/ISPOManager.cdc"

transaction() {

  prepare(acct: AuthAccount) {
    if acct.borrow<&ISPOManager.ISPO>(from: ISPOManager.ispoStoragePath) != nil {
      destroy acct.load<@ISPOManager.ISPO>(from: ISPOManager.ispoStoragePath)
    }
  }

  execute {}
}