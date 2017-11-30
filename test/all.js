// if test function expects second named argument it will be executed
// in async mode and test will be complete only after callback is called
exports['test simple mapping'] = function(assert, done) {
  const kms = require('kmsmapper')
  var obj={
    "a_name":"local value"
  }
  var newValue = new Date().getTime().toString()
  kms.putParameter("/test/","a_name",newValue).then((resp)=>{
    console.log(resp)
    kms.modifyObj(obj,null,"/test/").then((obj)=>{
      console.log(obj)
      assert.equal(obj["a_name"],newValue,'Parameter read from KMS')
      done()
    })
  })
}

exports['test cached mapping'] = function(assert, done) {
  const kms = require('kmsmapper')
  const cache = require('cachedata')
  cache.clear()
  var obj={
    "a_name":"local value"
  }
  var newValue = new Date().getTime().toString()
  kms.putParameter("/test/","a_name",newValue).then((resp)=>{
    console.log(resp)
    kms.modifyObj(obj,null,"/test/").then((obj)=>{
      console.log(obj)
      assert.equal(obj["a_name"],newValue,'Parameter read from KMS')
      var params = cache.getData("kms")
      assert.notEqual(params,null,"The KMS results should now be cached")
      obj = obj={
        "a_name":"local value"
      }
      kms.setObjVariables(obj,params)
      assert.equal(obj["a_name"],newValue,'Parameter read from KMS Cache')
      done()
    })
  })
}


if (module == require.main) require('test').run(exports)
