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

exports['test promise mapping'] = function(assert, done) {
  const kms = require('kmsmapper')
  const cache = require('cachedata')
  cache.clear()
  var obj={
    "another_name":"local value"
  }
  var newValue = new Date().getTime().toString()
  kms.putParameter("/test/","another_name",newValue).then((resp)=>{
    console.log(resp)
    var promise = kms.promiseToModifyObject(obj,null,"/test/")
    promise()
      .then((obj)=>{
      console.log(obj)
      assert.equal(obj["another_name"],newValue,'Parameter read from KMS')
      done()
    })
  })
}


exports['test promise mapping lambda'] = function(assert, done) {
  const kms = require('kmsmapper')
  const cache = require('cachedata')
  const lambdawrap = require('lambswool')
  cache.clear()
  var testmodule={
    exports:{
      foo : (event,context,cb) =>{
        cb(null,"foo")
      }
    }
  }
  var obj={
    "another_name":"local value"
  }
  var newValue = new Date().getTime().toString()
  var cb = (err,res) =>{
    if (err) {
      console.log("ERROR",err)
    } else {
      console.log("OK",res)
    }
    assert.equal(err,null,"Expected no error")
    assert.equal(obj["another_name"],newValue,'Parameter read from KMS')
    done()
  }

  kms.putParameter("/test/","another_name",newValue).then((resp)=>{

    console.log(resp)
    var promise = kms.promiseToModifyObject(obj,null,"/test/")
    lambdawrap.wrapModuleExportsWithPromise(testmodule,promise)
    testmodule.exports.foo(null,null,cb)
  })
}

exports['test lambda environment variables'] = function(assert, done) {
  const kms = require('kmsmapper')
  const cache = require('cachedata')
  const lambdawrap = require('lambswool')
  cache.clear()
  var testmodule={
    exports:{
      foo : (event,context,cb) =>{
        cb(null,"foo")
      }
    }
  }
  process.env["unchanged"]="unchanged"
  process.env["changed"]="unchanged"

  var newValue = new Date().getTime().toString()
  var cb = (err,res) =>{
    if (err) {
      console.log("ERROR",err)
    } else {
      console.log("OK",res)
    }
    assert.equal(err,null,"Expected no error")
    assert.equal(process.env["changed"],newValue,'Parameter read from KMS')
    assert.equal(process.env["unchanged"],"unchanged",'Parameter unchanged')
    done()
  }

  kms.putParameter("/test/","changed",newValue).then((resp)=>{
    console.log(resp)
    var promise = kms.promiseToModifyObject(process.env,null,"/test/")
    lambdawrap.wrapModuleExportsWithPromise(testmodule,promise)
    testmodule.exports.foo(null,null,cb)
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

exports['test put get and delete parameter'] = function (assert, done) {
  const kms = require('../index.js')

  var prefix = '/test/'
  var key = 'deleteme'
  var newValue = new Date().getTime().toString()

  kms.putParameter(prefix, key, newValue)
    .then((resp) => {
      assert.notEqual(resp, null, 'put parameter ' + key)
    })
    .then(() => {
      return kms.getParameter(prefix, key).then((resp) => {
        assert.equal(resp.Parameter.Value, newValue, 'got parameter ' + key)
      })
    })
    .then(() => {
      return kms.deleteParameter(prefix, key).then((resp) => {
        assert.notEqual(resp, null, 'deleted parameter ' + key)
      })
    })
    .then(() => {
      return kms.getParameter(prefix, key).catch((err) => {
        assert.notEqual(err, null, key + ' is no longer available')
        done()
      })
    })
}

if (module == require.main) require('test').run(exports)
