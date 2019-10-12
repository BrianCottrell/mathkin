import * as KinBase from "../src"

var keypair = KinBase.Keypair.random();
var data = 'data to sign';
var signature = KinBase.sign(data, keypair.rawSecretKey());

console.log('Signature: '+signature.toString('hex'));

if (KinBase.verify(data, signature, keypair.rawPublicKey())) {
  console.log('OK!');
} else {
  console.log('Bad signature!');
}
