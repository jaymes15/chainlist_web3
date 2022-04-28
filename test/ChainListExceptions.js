// load contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

//test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var another_buyer = accounts[3];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 5;

  //no article for sale yet
  it("should throw exception when a user tries to buy article and no article for sale", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 0, "no article for sell");

    });
  });

  it("should throw exception when a seller tries to buy his own article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName,
        articleDescription,
        web3.toWei(articlePrice, "ether"),
        {from: seller}
      )

    }).then(function(){
      return chainListInstance.buyArticle(1,{
        from: seller,
        value: web3.toWei(articlePrice, "ether")
      })
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there should be 1 article for sale");
      assert.equal(data[0].toNumber(), 1, "only article id 1 should be up for sale");

      return  chainListInstance.articles(data[0]);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id should be 1");
      assert.equal(data[1], seller, "event seller must be "+ seller);
      assert.equal(data[2], 0x0, "event buyer must be empty");
      assert.equal(data[3],articleName, "event article name must be "+ articleName);
      assert.equal(data[4],articleDescription, "event articleDescription name must be "+ articleDescription);
      assert.equal(data[5], web3.toWei(articlePrice, "ether"), "event price must be "+ web3.toWei(articlePrice, "ether"));

    });
  });



  it("should throw exception when a buyer tries to buy an article for lesser than price", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName,
        articleDescription,
        web3.toWei(articlePrice, "ether"),
        {from: seller}
      )

    }).then(function(){
      return chainListInstance.buyArticle({
        from: buyer,
        value: web3.toWei(articlePrice - 4, "ether")
      })
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 2, "there should be 1 article for sale");
      assert.equal(data[0].toNumber(), 1, "only article id 1 should be up for sale");

      return  chainListInstance.articles(data[0]);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id should be 1");
      assert.equal(data[1], seller, "event seller must be "+ seller);
      assert.equal(data[2], 0x0, "event buyer must be empty");
      assert.equal(data[3],articleName, "event article name must be "+ articleName);
      assert.equal(data[4],articleDescription, "event articleDescription name must be "+ articleDescription);
      assert.equal(data[5], web3.toWei(articlePrice, "ether"), "event price must be "+ web3.toWei(articlePrice, "ether"));

    });
  });


  it("should throw exception when a buyer tries to buy an article that already sold", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: another_buyer,
        value: web3.toWei(articlePrice, "ether")
      })

    }).then(function(){
      return chainListInstance.buyArticle(1,{
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      })
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function(){
      return  chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id should be 1");
      assert.equal(data[1], seller, "event seller must be "+ seller);
      assert.equal(data[2], another_buyer, "event buyer must " + another_buyer);
      assert.equal(data[3],articleName, "event article name must be "+ articleName);
      assert.equal(data[4],articleDescription, "event articleDescription name must be "+ articleDescription);
      assert.equal(data[5], web3.toWei(articlePrice, "ether"), "event price must be "+ web3.toWei(articlePrice, "ether"));
    });
  });



});
