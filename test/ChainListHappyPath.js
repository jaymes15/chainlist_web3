var ChainList = artifacts.require("./ChainList.sol");

//test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];

  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 5;

  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 15;

  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("Should be initialized with empty values", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance
      return  chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 0, "number of articles must be zero");
      return chainListInstance.getArticlesForSale()
    }).then(function(data){
      assert.equal(data.length, 0, "there should be no article for sale")
    });
  });

  it("Should sell a first article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName1,
        articleDescription1,
        web3.toWei(articlePrice1, "ether"),
        {from: seller}
      )
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+ seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be "+ articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be "+ web3.toWei(articlePrice1, "ether"));

      return  chainListInstance.getNumberOfArticles();
    }).then(function(data){

      assert.equal(data.toNumber(), 1, "there should be 1 article for sale");

      return  chainListInstance.getArticlesForSale();
    }).then(function(data){
      console.log("hello")
      console.log(data[0].toNumber())
      assert.equal(data.length, 1, "there should be 1 article for sale");
      assert.equal(data[0].toNumber(), 1, "article id should be 1");

      return  chainListInstance.articles(data[0]);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id should be 1");
      assert.equal(data[1], seller, "event seller must be "+ seller);
      assert.equal(data[2], 0x0, "event buyer must be empty");
      assert.equal(data[3],articleName1, "event article name must be "+ articleName1);
      assert.equal(data[4],articleDescription1, "event articleDescription name must be "+ articleDescription1);
      assert.equal(data[5], web3.toWei(articlePrice1, "ether"), "event price must be "+ web3.toWei(articlePrice1, "ether"));

    });
  });

  it("Should sell a second article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName2,
        articleDescription2,
        web3.toWei(articlePrice2, "ether"),
        {from: seller}
      )
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+ seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be "+ articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event price must be "+ web3.toWei(articlePrice2, "ether"));

      return  chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 2, "there should be 2 article for sale");

      return  chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 2, "there should be 2 article for sale");
      assert.equal(data[1].toNumber(), 2, "article id should be 2");

      return  chainListInstance.articles(data[1]);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 2, "article id should be 2");
      assert.equal(data[1], seller, "event seller must be "+ seller);
      assert.equal(data[2], 0x0, "event buyer must be empty");
      assert.equal(data[3],articleName2, "event article name must be "+ articleName2);
      assert.equal(data[4],articleDescription2, "event articleDescription name must be "+ articleDescription2);
      assert.equal(data[5], web3.toWei(articlePrice2, "ether"), "event price must be "+ web3.toWei(articlePrice2, "ether"));

    });
  });

  it("Should buy an article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      // Record seller and buyer balances
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      })
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+ seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be "+ buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event seller must be "+ articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be "+ web3.toWei(articlePrice1, "ether"));

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1,"seller should have a balance of "+ articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <=  buyerBalanceBeforeBuy - articlePrice1,"buyer should have a balance of "+ articlePrice1 + " ETH");

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there should be 1 article for sale");
      assert.equal(data[0].toNumber(), 2, "only article id 2 should be up for sale");

      return  chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 2, "there should be 2 article in total");


    })
  });

  it("Should trigger an event", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName1,
        articleDescription1,
        web3.toWei(articlePrice1, "ether"),
        {from: seller}
      )
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 3, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be "+ seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event seller must be "+ articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be "+ web3.toWei(articlePrice1, "ether"));
    });
  });

});
