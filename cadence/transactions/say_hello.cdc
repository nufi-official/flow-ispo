import HelloWorld from "../contracts/HelloWorld.cdc"

transaction {

  prepare(acct: AuthAccount) {}

  execute {
    log(HelloWorld.hello())
  }
}
