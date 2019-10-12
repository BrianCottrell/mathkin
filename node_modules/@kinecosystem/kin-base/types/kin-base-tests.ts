import * as KinSdk from 'kin-base';

const sourceKey = KinSdk.Keypair.random(); // $ExpectType Keypair
const destKey = KinSdk.Keypair.random();
const account = new KinSdk.Account(sourceKey.publicKey(), '1');
const transaction = new KinSdk.TransactionBuilder(account)
    .addOperation(KinSdk.Operation.accountMerge({destination: destKey.publicKey()}))
    .addMemo(new KinSdk.Memo(KinSdk.MemoText, "memo"))
    .setTimeout(5)
    .build(); // $ExpectType () => Transaction<Memo<MemoType>, Operation[]>

const sig = KinSdk.xdr.DecoratedSignature.fromXDR(Buffer.of(1, 2)); // $ExpectType DecoratedSignature
sig.hint(); // $ExpectType Buffer
sig.signature(); // $ExpectType Buffer

KinSdk.Memo.none(); // $ExpectType Memo<"none">
KinSdk.Memo.text('asdf'); // $ExpectType Memo<"text">
KinSdk.Memo.id('asdf'); // $ExpectType Memo<"id">
KinSdk.Memo.return('asdf'); // $ExpectType Memo<"return">
KinSdk.Memo.hash('asdf'); // $ExpectType Memo<"hash">
KinSdk.Memo.none().value; // $ExpectType null
KinSdk.Memo.id('asdf').value; // $ExpectType string
KinSdk.Memo.text('asdf').value; // $ExpectType string | Buffer
KinSdk.Memo.return('asdf').value; // $ExpectType Buffer
KinSdk.Memo.hash('asdf').value; // $ExpectType Buffer

// P.S. don't use Memo constructor
(new KinSdk.Memo(KinSdk.MemoHash, 'asdf')).value; // $ExpectType MemoValue
// (new KinSdk.Memo(KinSdk.MemoHash, 'asdf')).type; // $ExpectType MemoType  // TODO: Inspect what's wrong with linter.

const noSignerXDR = KinSdk.Operation.setOptions({lowThreshold: 1});
KinSdk.Operation.fromXDRObject(noSignerXDR).signer; // $ExpectType never

const newSignerXDR1 = KinSdk.Operation.setOptions({signer: {ed25519PublicKey: sourceKey.publicKey(), weight: '1'}});
KinSdk.Operation.fromXDRObject(newSignerXDR1).signer; // $ExpectType Ed25519PublicKey

const newSignerXDR2 = KinSdk.Operation.setOptions({signer: {sha256Hash: Buffer.from(''), weight: '1'}});
KinSdk.Operation.fromXDRObject(newSignerXDR2).signer; // $ExpectType Sha256Hash

const newSignerXDR3 = KinSdk.Operation.setOptions({signer: {preAuthTx: '', weight: 1}});
KinSdk.Operation.fromXDRObject(newSignerXDR3).signer; // $ExpectType PreAuthTx

KinSdk.TimeoutInfinite; // $ExpectType 0
