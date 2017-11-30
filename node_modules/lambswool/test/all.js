


exports['test simple wrapper'] = function(assert, done) {

  const lambdawrap = require('lambswool')
  var testmodule={
    exports:{
      foo : (event,context,cb) =>{
        cb(null,"foo")
      }
    }
  }
  var promisedValue = "foo"
  var cb = (err,res) =>{
    if (err) {
      console.log("ERROR",err)
    } else {
      console.log("OK",res)
    }
    assert.equal(err,null,"Expected no error")
    assert.equal(promisedValue,"bar",'Parameter changed in promise')
    done()
  }
  var promise = () => new Promise( (resolve,reject)=>{
    console.log("Promise Test")
    promisedValue = "bar"
    resolve("Promise Tested")
  }  )
  lambdawrap.wrapModuleExportsWithPromise(testmodule,promise)
  testmodule.exports.foo(null,null,cb)
}

exports['test exception wrapper'] = function(assert, done) {

  const lambdawrap = require('lambswool')
  var testmodule={
    exports:{
      foo : (event,context,cb) =>{
        cb(null,"foo")
      }
    }
  }
  var promisedValue = "foo"
  var cb = (err,res) =>{
    if (err) {
      console.log("ERROR",err)
    } else {
      console.log("OK",res)
    }
    assert.notEqual(err,null,"Expected error")
    assert.equal(promisedValue,"bar",'Parameter changed in promise')
    done()
  }
  var promise = () => new Promise( (resolve,reject)=>{
    console.log("Promise Test Exception")
    promisedValue = "bar"
    console.log("Tossing an exception")
    reject("Expected Error")

  }  )
  lambdawrap.wrapModuleExportsWithPromise(testmodule,promise)
  testmodule.exports.foo(null,null,cb)
}


if (module == require.main) require('test').run(exports)
