import crypto from 'crypto';

describe('Transaction', function() {

  it("constructs Transaction object from a TransactionEnvelope", function(done) {
    let source      = new KinBase.Account("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB", "0");
    let destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    let asset       = KinBase.Asset.native();
    let amount      = "2000";

    let input = new KinBase.TransactionBuilder(source)
                .addOperation(KinBase.Operation.payment({destination, asset, amount}))
                .addMemo(KinBase.Memo.text('Happy birthday!'))
                .setTimeout(KinBase.TimeoutInfinite)
                .build()
                .toEnvelope()
                .toXDR('base64');


    var transaction = new KinBase.Transaction(input);
    var operation = transaction.operations[0];

    expect(transaction.source).to.be.equal(source.accountId());
    expect(transaction.fee).to.be.equal(100);
    expect(transaction.memo.type).to.be.equal(KinBase.MemoText);
    expect(transaction.memo.value.toString('ascii')).to.be.equal('Happy birthday!');
    expect(operation.type).to.be.equal('payment');
    expect(operation.destination).to.be.equal(destination);
    expect(operation.amount).to.be.equal(amount);

    done();
  });

  beforeEach(function() {
    KinBase.Network.useTestNetwork();
  })

  afterEach(function() {
    KinBase.Network.use(null);
  })

  it("does not sign when no Network selected", function() {
    KinBase.Network.use(null);
    let source      = new KinBase.Account("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB", "0");
    let destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    let asset       = KinBase.Asset.native();
    let amount      = "2000";
    let signer      = KinBase.Keypair.random();

    let tx = new KinBase.TransactionBuilder(source)
                .addOperation(KinBase.Operation.payment({destination, asset, amount}))
                .setTimeout(KinBase.TimeoutInfinite)
                .build();
    expect(() => tx.sign(signer)).to.throw(/No network selected/);
  });

  it("signs correctly", function() {
    let source      = new KinBase.Account("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB", "0");
    let destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    let asset       = KinBase.Asset.native();
    let amount      = "2000";
    let signer      = KinBase.Keypair.master();

    let tx = new KinBase.TransactionBuilder(source)
                .addOperation(KinBase.Operation.payment({destination, asset, amount}))
                .setTimeout(KinBase.TimeoutInfinite)
                .build();
    tx.sign(signer);

    let env = tx.toEnvelope();

    let rawSig = env.signatures()[0].signature();
    let verified = signer.verify(tx.hash(), rawSig);
    expect(verified).to.equal(true);
  });

  it("signs using hash preimage", function() {
    let source      = new KinBase.Account("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB", "0");
    let destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    let asset       = KinBase.Asset.native();
    let amount      = "2000";

    let preimage = crypto.randomBytes(64);
    let hash = crypto.createHash('sha256').update(preimage).digest();

    let tx = new KinBase.TransactionBuilder(source)
                .addOperation(KinBase.Operation.payment({destination, asset, amount}))
                .setTimeout(KinBase.TimeoutInfinite)
                .build();
    tx.signHashX(preimage);

    let env = tx.toEnvelope();
    expectBuffersToBeEqual(env.signatures()[0].signature(), preimage);
    expectBuffersToBeEqual(env.signatures()[0].hint(), hash.slice(hash.length - 4));
  });

  it("returns error when signing using hash preimage that is too long", function() {
    let source      = new KinBase.Account("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB", "0");
    let destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    let asset       = KinBase.Asset.native();
    let amount      = "2000";

    let preimage = crypto.randomBytes(2*64);
    let hash = crypto.createHash('sha256').update(preimage).digest();

    let tx = new KinBase.TransactionBuilder(source)
                .addOperation(KinBase.Operation.payment({destination, asset, amount}))
                .setTimeout(KinBase.TimeoutInfinite)
                .build();

    expect(() => tx.signHashX(preimage)).to.throw(/preimage cannnot be longer than 64 bytes/);
  });

  it("accepts 0 as a valid transaction fee", function(done) {
    let source      = new KinBase.Account("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB", "0");
    let destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    let asset       = KinBase.Asset.native();
    let amount      = "2000";
    let fee         = 0;

    let input = new KinBase.TransactionBuilder(source, {fee: 0})
                .addOperation(KinBase.Operation.payment({destination, asset, amount}))
                .addMemo(KinBase.Memo.text('Happy birthday!'))
                .setTimeout(KinBase.TimeoutInfinite)
                .build()
                .toEnvelope()
                .toXDR('base64');


    var transaction = new KinBase.Transaction(input);
    var operation = transaction.operations[0];

    expect(transaction.fee).to.be.equal(0);

    done();
  });

});

function expectBuffersToBeEqual(left, right) {
  let leftHex = left.toString('hex');
  let rightHex = right.toString('hex');
  expect(leftHex).to.eql(rightHex);
}
