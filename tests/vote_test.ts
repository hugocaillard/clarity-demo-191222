import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v1.2.0/index.ts";

Clarinet.test({
  name: "Ensure get-results return right results",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const address1 = accounts.get("wallet_1")!.address;
    const response = chain.callReadOnlyFn("vote", "get-results", [], address1);

    const votesResults = response.result.expectOk().expectTuple();
    votesResults.apple.expectUint(0);
    votesResults.orange.expectUint(0);
  },
});

Clarinet.test({
  name: "Ensure that vote can be called with valid values only",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const address1 = accounts.get("wallet_1")!.address;
    const address2 = accounts.get("wallet_2")!.address;
    const address3 = accounts.get("wallet_3")!.address;

    const block = chain.mineBlock([
      Tx.contractCall("vote", "vote", [types.ascii("orange")], address1),
      Tx.contractCall("vote", "vote", [types.ascii("apple")], address2),
      Tx.contractCall("vote", "vote", [types.ascii("kiwi")], address3),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr().expectUint(1002);
  },
});

Clarinet.test({
  name: "Ensure that address can not vote twice",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const address1 = accounts.get("wallet_1")!.address;

    chain.mineBlock([
      Tx.contractCall("vote", "vote", [types.ascii("orange")], address1),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall("vote", "vote", [types.ascii("apple")], address1),
    ]);

    block.receipts[0].result.expectErr().expectUint(1001);
  },
});

Clarinet.test({
  name: "Ensure vote is closed after 2016 blocks",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const address1 = accounts.get("wallet_1")!.address;

    chain.mineEmptyBlockUntil(2016);
    const block = chain.mineBlock([
      Tx.contractCall("vote", "vote", [types.ascii("apple")], address1),
    ]);

    block.receipts[0].result.expectErr().expectUint(1003);
  },
});
