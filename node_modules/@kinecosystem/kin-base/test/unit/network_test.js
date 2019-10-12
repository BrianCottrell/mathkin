describe("Network.current()", function() {
  it("defaults network is null", function() {
    expect(KinBase.Network.current()).to.be.null;
  });
});

describe("Network.useTestNetwork()", function() {
  it("switches to the test network", function() {
    KinBase.Network.useTestNetwork();
    expect(KinBase.Network.current().networkPassphrase()).to.equal(KinBase.Networks.TESTNET)
  });
});

describe("Network.usePublicNetwork()", function() {
  it("switches to the public network", function() {
    KinBase.Network.usePublicNetwork();
    expect(KinBase.Network.current().networkPassphrase()).to.equal(KinBase.Networks.PUBLIC)
  });
});
