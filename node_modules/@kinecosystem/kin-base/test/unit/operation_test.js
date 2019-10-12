import BigNumber from 'bignumber.js';
import crypto from 'crypto';
import isString from 'lodash/isString';

describe('Operation', function() {

    describe(".createAccount()", function () {
        it("creates a createAccountOp", function () {
            var destination = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
            var startingBalance = '1000';
            let op = KinBase.Operation.createAccount({destination, startingBalance});
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("createAccount");
            expect(obj.destination).to.be.equal(destination);
            expect(operation.body().value().startingBalance().toString()).to.be.equal('100000000');
            expect(obj.startingBalance).to.be.equal(startingBalance);
        });

        it("fails to create createAccount operation with an invalid destination address", function () {
            let opts = {
                destination: 'GCEZW',
                startingBalance: '20',
                source: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
            };
            expect(() => KinBase.Operation.createAccount(opts)).to.throw(/destination is invalid/)
        });

        it("fails to create createAccount operation with an invalid startingBalance", function () {
            let opts = {
                destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
                startingBalance: 20,
                source: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
            };
            expect(() => KinBase.Operation.createAccount(opts)).to.throw(/startingBalance argument must be of type String, represent a positive number and have at most 7 digits after the decimal/)
        });

        it("fails to create createAccount operation with an invalid source address", function () {
            let opts = {
                destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
                startingBalance: '20',
                source: 'GCEZ'
            };
            expect(() => KinBase.Operation.createAccount(opts)).to.throw(/Source address is invalid/)
        });
    });

    describe(".payment()", function () {
        it("creates a paymentOp", function () {
            var destination = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
            var amount = "1000";
            var asset = new KinBase.Asset("USDUSD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            let op = KinBase.Operation.payment({destination, asset, amount});
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("payment");
            expect(obj.destination).to.be.equal(destination);
            expect(operation.body().value().amount().toString()).to.be.equal('100000000');
            expect(obj.amount).to.be.equal(amount);
            expect(obj.asset.equals(asset)).to.be.true;
        });

        it("fails to create payment operation with an invalid destination address", function () {
            let opts = {
                destination: 'GCEZW',
                asset: KinBase.Asset.native(),
                amount: '20'
            };
            expect(() => KinBase.Operation.payment(opts)).to.throw(/destination is invalid/)
        });

        it("fails to create payment operation with an invalid amount", function () {
            let opts = {
                destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
                asset: KinBase.Asset.native(),
                amount: 20
            };
            expect(() => KinBase.Operation.payment(opts)).to.throw(/amount argument must be of type String/)
        });
    });

    describe(".pathPayment()", function () {
        it("creates a pathPaymentOp", function() {
            var sendAsset = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            var sendMax = '3.007';
            var destination = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
            var destAsset = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            var destAmount = '3.1415';
            var path = [
                new KinBase.Asset('USD', 'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'),
                new KinBase.Asset('EUR', 'GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL')
            ];
            let op = KinBase.Operation.pathPayment({sendAsset, sendMax, destination, destAsset, destAmount, path});
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("pathPayment");
            expect(obj.sendAsset.equals(sendAsset)).to.be.true;
            expect(operation.body().value().sendMax().toString()).to.be.equal('300700');
            expect(obj.sendMax).to.be.equal(sendMax);
            expect(obj.destination).to.be.equal(destination);
            expect(obj.destAsset.equals(destAsset)).to.be.true;
            expect(operation.body().value().destAmount().toString()).to.be.equal('314150');
            expect(obj.destAmount).to.be.equal(destAmount);
            expect(obj.path[0].getCode()).to.be.equal('USD');
            expect(obj.path[0].getIssuer()).to.be.equal('GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB');
            expect(obj.path[1].getCode()).to.be.equal('EUR');
            expect(obj.path[1].getIssuer()).to.be.equal('GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL');
        });

        it("fails to create path payment operation with an invalid destination address", function () {
            let opts = {
                destination: 'GCEZW',
                sendMax: '20',
                destAmount: '50',
                sendAsset: KinBase.Asset.native(),
                destAsset: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.pathPayment(opts)).to.throw(/destination is invalid/)
        });

        it("fails to create path payment operation with an invalid sendMax", function () {
            let opts = {
                destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
                sendMax: 20,
                destAmount: '50',
                sendAsset: KinBase.Asset.native(),
                destAsset: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.pathPayment(opts)).to.throw(/sendMax argument must be of type String/)
        });

        it("fails to create path payment operation with an invalid destAmount", function () {
            let opts = {
                destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
                sendMax: '20',
                destAmount: 50,
                sendAsset: KinBase.Asset.native(),
                destAsset: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.pathPayment(opts)).to.throw(/destAmount argument must be of type String/)
        });
    });

    describe(".changeTrust()", function () {
        it("creates a changeTrustOp", function () {
            let asset = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            let op = KinBase.Operation.changeTrust({asset: asset});
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("changeTrust");
            expect(obj.line).to.be.deep.equal(asset);
            expect(operation.body().value().limit().toString()).to.be.equal('9223372036854775807'); // MAX_INT64
            expect(obj.limit).to.be.equal("92233720368547.75807");
        });

        it("creates a changeTrustOp with limit", function () {
            let asset = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            let op = KinBase.Operation.changeTrust({asset: asset, limit: "50"});
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("changeTrust");
            expect(obj.line).to.be.deep.equal(asset);
            expect(operation.body().value().limit().toString()).to.be.equal('5000000');
            expect(obj.limit).to.be.equal("50");
        });

        it("deletes a trustline", function () {
            let asset = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            let op = KinBase.Operation.changeTrust({asset: asset, limit: "0"});
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("changeTrust");
            expect(obj.line).to.be.deep.equal(asset);
            expect(obj.limit).to.be.equal("0");
        });

        it("throws TypeError for incorrect limit argument", function () {
            let asset = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            let changeTrust = () => KinBase.Operation.changeTrust({asset: asset, limit: 0});
            expect(changeTrust).to.throw(TypeError);
        });
    });

    describe(".allowTrust()", function () {
        it("creates a allowTrustOp", function () {
            let trustor = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
            let assetCode = "USD";
            let authorize = true;
            let op = KinBase.Operation.allowTrust({
                trustor: trustor,
                assetCode: assetCode,
                authorize: authorize
            });
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("allowTrust");
            expect(obj.trustor).to.be.equal(trustor);
            expect(obj.assetCode).to.be.equal(assetCode);
            expect(obj.authorize).to.be.equal(authorize);
        });

        it("fails to create allowTrust operation with an invalid trustor address", function () {
            let opts = {
                trustor: 'GCEZW'
            };
            expect(() => KinBase.Operation.allowTrust(opts)).to.throw(/trustor is invalid/)
        });
    });

    describe(".setOptions()", function () {
        it("auth flags are set correctly", function () {
            expect(KinBase.AuthRequiredFlag).to.be.equal(1);
            expect(KinBase.AuthRevocableFlag).to.be.equal(2);
            expect(KinBase.AuthImmutableFlag).to.be.equal(4);
        });

        it("creates a setOptionsOp", function () {
            var opts = {};
            opts.inflationDest = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
            opts.clearFlags = KinBase.AuthRevocableFlag | KinBase.AuthImmutableFlag;
            opts.setFlags = KinBase.AuthRequiredFlag;
            opts.masterWeight = 0;
            opts.lowThreshold = 1;
            opts.medThreshold = 2;
            opts.highThreshold = 3;

            opts.signer = {
                ed25519PublicKey: "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
                weight: 1
            };
            opts.homeDomain = "www.example.com";
            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expect(obj.type).to.be.equal("setOptions");
            expect(obj.inflationDest).to.be.equal(opts.inflationDest);
            expect(obj.clearFlags).to.be.equal(6);
            expect(obj.setFlags).to.be.equal(1);
            expect(obj.masterWeight).to.be.equal(opts.masterWeight);
            expect(obj.lowThreshold).to.be.equal(opts.lowThreshold);
            expect(obj.medThreshold).to.be.equal(opts.medThreshold);
            expect(obj.highThreshold).to.be.equal(opts.highThreshold);

            expect(obj.signer.ed25519PublicKey).to.be.equal(opts.signer.ed25519PublicKey);
            expect(obj.signer.weight).to.be.equal(opts.signer.weight);
            expect(obj.homeDomain.toString()).to.be.equal(opts.homeDomain);
        });

        it("creates a setOptionsOp with preAuthTx signer", function () {
            var opts = {};

            var hash = crypto.createHash('sha256').update("Tx hash").digest();

            opts.signer = {
                preAuthTx: hash,
                weight: 10
            };
            
            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expectBuffersToBeEqual(obj.signer.preAuthTx, hash);
            expect(obj.signer.weight).to.be.equal(opts.signer.weight);
        });

        it("creates a setOptionsOp with preAuthTx signer from a hex string", function () {
            var opts = {};

            var hash = crypto.createHash('sha256').update("Tx hash").digest('hex');
            expect(isString(hash)).to.be.true

            opts.signer = {
                preAuthTx: hash,
                weight: 10
            };

            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expectBuffersToBeEqual(obj.signer.preAuthTx, hash);
            expect(obj.signer.weight).to.be.equal(opts.signer.weight);
        });

        it("creates a setOptionsOp with hash signer", function () {
            var opts = {};

            var hash = crypto.createHash('sha256').update("Hash Preimage").digest();

            opts.signer = {
                sha256Hash: hash,
                weight: 10
            };
            
            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expectBuffersToBeEqual(obj.signer.sha256Hash, hash);
            expect(obj.signer.weight).to.be.equal(opts.signer.weight);
        });

        it("creates a setOptionsOp with hash signer from a hex string", function () {
            var opts = {};

            var hash = crypto.createHash('sha256').update("Hash Preimage").digest('hex');
            expect(isString(hash)).to.be.true

            opts.signer = {
                sha256Hash: hash,
                weight: 10
            };

            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expectBuffersToBeEqual(obj.signer.sha256Hash, hash);
            expect(obj.signer.weight).to.be.equal(opts.signer.weight);
        });

        it("empty homeDomain is decoded correctly", function () {
            const keypair = KinBase.Keypair.random()
            const account = new KinBase.Account(keypair.publicKey(), '0')

            // First operation do nothing.
            const tx1 = new KinBase.TransactionBuilder(account)
              .addOperation(KinBase.Operation.setOptions({}))
              .setTimeout(KinBase.TimeoutInfinite)
              .build()

            // Second operation unset homeDomain
            const tx2 = new KinBase.TransactionBuilder(account)
              .addOperation(KinBase.Operation.setOptions({ homeDomain: ''}))
              .setTimeout(KinBase.TimeoutInfinite)
              .build()

            expect(tx1.operations[0].homeDomain).to.be.undefined;
            expect(tx2.operations[0].homeDomain).to.be.equal('');

        });

        it("string setFlags", function() {
            let opts = {
                setFlags: '4'
            };
            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expect(obj.type).to.be.equal("setOptions");
            expect(obj.setFlags).to.be.equal(4);
        });

        it("fails to create setOptions operation with an invalid setFlags", function () {
            let opts = {
                setFlags: {}
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw();
        });

        it("string clearFlags", function() {
            let opts = {
                clearFlags: '4'
            };
            let op = KinBase.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);

            expect(obj.type).to.be.equal("setOptions");
            expect(obj.clearFlags).to.be.equal(4);
        });

        it("fails to create setOptions operation with an invalid clearFlags", function () {
            let opts = {
                clearFlags: {}
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw();
        });

        it("fails to create setOptions operation with an invalid inflationDest address", function () {
            let opts = {
                inflationDest: 'GCEZW'
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/inflationDest is invalid/)
        });

        it("fails to create setOptions operation with an invalid signer address", function () {
            let opts = {
                signer: {
                    ed25519PublicKey: "GDGU5OAPHNPU5UCL",
                    weight: 1
                }
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/signer.ed25519PublicKey is invalid/)
        });

        it("fails to create setOptions operation with multiple signer values", function () {
            let opts = {
                signer: {
                    ed25519PublicKey: "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
                    sha256Hash: Buffer.alloc(32),
                    weight: 1
                }
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/Signer object must contain exactly one/)
        });

        it("fails to create setOptions operation with an invalid masterWeight", function() {
            let opts = {
                masterWeight: 400
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/masterWeight value must be between 0 and 255/)
        });

        it("fails to create setOptions operation with an invalid lowThreshold", function() {
            let opts = {
                lowThreshold: 400
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/lowThreshold value must be between 0 and 255/)
        });

        it("fails to create setOptions operation with an invalid medThreshold", function() {
            let opts = {
                medThreshold: 400
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/medThreshold value must be between 0 and 255/)
        });

        it("fails to create setOptions operation with an invalid highThreshold", function() {
            let opts = {
                highThreshold: 400
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/highThreshold value must be between 0 and 255/)
        });

        it("fails to create setOptions operation with an invalid homeDomain", function() {
            let opts = {
                homeDomain: 67238
            };
            expect(() => KinBase.Operation.setOptions(opts)).to.throw(/homeDomain argument must be of type String/)
        });
    });

    describe(".manageOffer", function () {
        it("creates a manageOfferOp (string price)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '3.12345';
            opts.price = '8.141592';
            opts.offerId = '1';
            let op = KinBase.Operation.manageOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageOffer");
            expect(obj.selling.equals(opts.selling)).to.be.true;
            expect(obj.buying.equals(opts.buying)).to.be.true;
            expect(operation.body().value().amount().toString()).to.be.equal('312345');
            expect(obj.amount).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal(opts.price);
            expect(obj.offerId).to.be.equal(opts.offerId);
        });
        it("creates a manageOfferOp (price fraction)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '3.12345';
            opts.price = {
                n: 11,
                d: 10
            }
            opts.offerId = '1';
            let op = KinBase.Operation.manageOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.price).to.be.equal(new BigNumber(opts.price.n).div(opts.price.d).toString());
        });

        it("creates an invalid manageOfferOp (price fraction)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '3.12345';
            opts.price = {
                n: 11,
                d: -1
            }
            opts.offerId = '1';
            expect(() => KinBase.Operation.manageOffer(opts)).to.throw(/price must be positive/)
        });
        it("creates a manageOfferOp (number price)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '3.12345';
            opts.price = 3.07;
            opts.offerId = 1;
            let op = KinBase.Operation.manageOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageOffer");
            expect(obj.price).to.be.equal(opts.price.toString());
        });

        it("creates a manageOfferOp (BigNumber price)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '3.12345';
            opts.price = new BigNumber(5).dividedBy(4);
            opts.offerId = '1';
            let op = KinBase.Operation.manageOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageOffer");
            expect(obj.price).to.be.equal("1.25");
        });

        it("creates a manageOfferOp with no offerId", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '1000';
            opts.price = '3.14159';
            let op = KinBase.Operation.manageOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageOffer");
            expect(obj.selling.equals(opts.selling)).to.be.true;
            expect(obj.buying.equals(opts.buying)).to.be.true;
            expect(operation.body().value().amount().toString()).to.be.equal('100000000');
            expect(obj.amount).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal(opts.price);
            expect(obj.offerId).to.be.equal('0'); // 0=create a new offer, otherwise edit an existing offer
        });

        it("cancels offer", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '0';
            opts.price = '3.14159';
            opts.offerId = '1';
            let op = KinBase.Operation.manageOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageOffer");
            expect(obj.selling.equals(opts.selling)).to.be.true;
            expect(obj.buying.equals(opts.buying)).to.be.true;
            expect(operation.body().value().amount().toString()).to.be.equal('0');
            expect(obj.amount).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal(opts.price);
            expect(obj.offerId).to.be.equal('1'); // 0=create a new offer, otherwise edit an existing offer
        });

        it("fails to create manageOffer operation with an invalid amount", function () {
            let opts = {
                amount: 20,
                price: '10',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.manageOffer(opts)).to.throw(/amount argument must be of type String/)
        });

        it("fails to create manageOffer operation with missing price", function () {
            let opts = {
                amount: '20',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.manageOffer(opts)).to.throw(/price argument is required/)
        });

        it("fails to create manageOffer operation with negative price", function () {
            let opts = {
                amount: '20',
                price: '-1',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.manageOffer(opts)).to.throw(/price must be positive/)
        });

        it("fails to create manageOffer operation with invalid price", function () {
            let opts = {
                amount: '20',
                price: 'test',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.manageOffer(opts)).to.throw(/not a number/)
        });
    });

    describe(".createPassiveOffer", function () {
        it("creates a createPassiveOfferOp (string price)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '11.27827';
            opts.price = '3.07';
            let op = KinBase.Operation.createPassiveOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("createPassiveOffer");
            expect(obj.selling.equals(opts.selling)).to.be.true;
            expect(obj.buying.equals(opts.buying)).to.be.true;
            expect(operation.body().value().amount().toString()).to.be.equal('1127827');
            expect(obj.amount).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal(opts.price);
        });

        it("creates a createPassiveOfferOp (number price)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '11.27827';
            opts.price = 3.07;
            let op = KinBase.Operation.createPassiveOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("createPassiveOffer");
            expect(obj.selling.equals(opts.selling)).to.be.true;
            expect(obj.buying.equals(opts.buying)).to.be.true;
            expect(operation.body().value().amount().toString()).to.be.equal('1127827');
            expect(obj.amount).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal(opts.price.toString());
        });

        it("creates a createPassiveOfferOp (BigNumber price)", function () {
            var opts = {};
            opts.selling = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.buying = new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7");
            opts.amount = '11.27827';
            opts.price = new BigNumber(5).dividedBy(4);
            let op = KinBase.Operation.createPassiveOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("createPassiveOffer");
            expect(obj.selling.equals(opts.selling)).to.be.true;
            expect(obj.buying.equals(opts.buying)).to.be.true;
            expect(operation.body().value().amount().toString()).to.be.equal('1127827');
            expect(obj.amount).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal('1.25');
        });

        it("fails to create createPassiveOffer operation with an invalid amount", function () {
            let opts = {
                amount: 20,
                price: '10',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.createPassiveOffer(opts)).to.throw(/amount argument must be of type String/)
        });

        it("fails to create createPassiveOffer operation with missing price", function () {
            let opts = {
                amount: '20',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.createPassiveOffer(opts)).to.throw(/price argument is required/)
        });

        it("fails to create createPassiveOffer operation with negative price", function () {
            let opts = {
                amount: '20',
                price: '-2',
                selling: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
                buying: new KinBase.Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7")
            };
            expect(() => KinBase.Operation.createPassiveOffer(opts)).to.throw(/price must be positive/)
        });
    });

    describe(".accountMerge", function () {
        it("creates a accountMergeOp", function () {
            var opts = {};
            opts.destination = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
            let op = KinBase.Operation.accountMerge(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("accountMerge");
            expect(obj.destination).to.be.equal(opts.destination);
        });

        it("fails to create accountMerge operation with an invalid destination address", function () {
            let opts = {
                destination: 'GCEZW'
            };
            expect(() => KinBase.Operation.accountMerge(opts)).to.throw(/destination is invalid/)
        });
    });

    describe(".inflation", function () {
        it("creates a inflationOp", function () {
            let op = KinBase.Operation.inflation();
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("inflation");
        });
    });

    describe(".manageData", function () {
        it("creates a manageDataOp with string value", function () {
            var opts = {
                name: "name",
                value: "value"
            };
            let op = KinBase.Operation.manageData(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageData");
            expect(obj.name).to.be.equal(opts.name);
            expect(obj.value.toString('ascii')).to.be.equal(opts.value);
        });

        it("creates a manageDataOp with Buffer value", function () {
            var opts = {
                name: "name",
                value: Buffer.from("value")
            };
            let op = KinBase.Operation.manageData(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageData");
            expect(obj.name).to.be.equal(opts.name);
            expect(obj.value.toString('hex')).to.be.equal(opts.value.toString('hex'));
        });

        it("creates a manageDataOp with null dataValue", function () {
            var opts = {
                name: "name",
                value: null
            };
            let op = KinBase.Operation.manageData(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("manageData");
            expect(obj.name).to.be.equal(opts.name);
            expect(obj.value).to.be.undefined;
        });

        describe("fails to create manageData operation", function () {
            it("name is not a string", function () {
                expect(() => KinBase.Operation.manageData({name: 123})).to.throw()
            });

            it("name is too long", function () {
                expect(() => KinBase.Operation.manageData({name: "a".repeat(65)})).to.throw()
            });

            it("value is too long", function () {
                expect(() => KinBase.Operation.manageData({name: "a", value: Buffer.alloc(65)})).to.throw()
            });
        });
    });

    describe(".bumpSequence", function () {
        it("creates a bumpSequence", function () {
            var opts = {
                bumpTo: "77833036561510299"
            };
            let op = KinBase.Operation.bumpSequence(opts);
            var xdr = op.toXDR("hex");
            var operation = KinBase.xdr.Operation.fromXDR(Buffer.from(xdr, "hex"));
            var obj = KinBase.Operation.fromXDRObject(operation);
            expect(obj.type).to.be.equal("bumpSequence");
            expect(obj.bumpTo).to.be.equal(opts.bumpTo);
        });

        it("fails when `bumpTo` is not string", function () {
            expect(() => KinBase.Operation.bumpSequence({bumpTo: 1000})).to.throw()
        });
    });

    describe("._checkUnsignedIntValue()", function () {
        it("returns true for valid values", function () {
            let values = [
                {value: 0, expected: 0},
                {value: 10, expected: 10},
                {value: "0", expected: 0},
                {value: "10", expected: 10},
                {value: undefined, expected: undefined}
            ];

            for (var i in values) {
                let {value, expected} = values[i];
                expect(KinBase.Operation._checkUnsignedIntValue(value, value)).to.be.equal(expected);
            }
        });

        it("throws error for invalid values", function () {
            let values = [
                {},
                [],
                "", // empty string
                "test", // string not representing a number
                "0.5",
                "-10",
                "-10.5",
                "Infinity",
                Infinity,
                "Nan",
                NaN
            ];

            for (var i in values) {
                let value = values[i];
                expect(() => KinBase.Operation._checkUnsignedIntValue(value, value)).to.throw();
            }
        });

        it("return correct values when isValidFunction is set", function () {
            expect(
                KinBase.Operation._checkUnsignedIntValue("test", undefined, value => value < 10)
            ).to.equal(undefined);

            expect(
                KinBase.Operation._checkUnsignedIntValue("test", 8, value => value < 10)
            ).to.equal(8);
            expect(
                KinBase.Operation._checkUnsignedIntValue("test", "8", value => value < 10)
            ).to.equal(8);

            expect(() => {
                KinBase.Operation._checkUnsignedIntValue("test", 12, value => value < 10);
            }).to.throw();
            expect(() => {
                KinBase.Operation._checkUnsignedIntValue("test", "12", value => value < 10);
            }).to.throw();
        });
    });

    describe(".isValidAmount()", function () {
        it("returns true for valid amounts", function () {
            let amounts = [
              "10",
              "0.10",
              "0.12345",
              "92233720368547.75807" // MAX
            ];

            for (var i in amounts) {
                expect(KinBase.Operation.isValidAmount(amounts[i])).to.be.true;
            }
        });

        it("returns false for invalid amounts", function () {
            let amounts = [
                100, // integer
                100.50, // float
                "", // empty string
                "test", // string not representing a number
                "0",
                "-10",
                "-10.5",
                "0.12345678",
                "92233720368547.75808", // Overflow
                "Infinity",
                Infinity,
                "Nan",
                NaN
            ];

            for (var i in amounts) {
                expect(KinBase.Operation.isValidAmount(amounts[i])).to.be.false;
            }
        });

        it("allows 0 only if allowZero argument is set to true", function () {
            expect(KinBase.Operation.isValidAmount("0")).to.be.false;
            expect(KinBase.Operation.isValidAmount("0", true)).to.be.true;
        });
    });
});

function expectBuffersToBeEqual(left, right) {
    let leftHex = left.toString('hex');
    let rightHex = right.toString('hex');
    expect(leftHex).to.eql(rightHex);
}
