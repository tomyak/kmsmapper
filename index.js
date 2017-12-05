const Promise = require('bluebird');
const AWS = require('aws-sdk');
const cache=require('cachedata')
AWS.config.update({region:'us-east-1'});
const ssm = Promise.promisifyAll(new AWS.SSM());
const BATCH_SIZE=10

var putParameter=(prefix,name,value)=>{
  var params = {
    Name: prefix + name, /* required */
    Type: "SecureString", /* required */
    Value: value,
    Overwrite: true
  };
  return ssm.putParameterAsync(params);
}

var getParameter=(prefix,name)=>{
    let req={
      Name: prefix + name,
      WithDecryption:true
    };
    return ssm.getParameterAsync(req)
}

var deleteParameter=(prefix,name)=>{
  let req={
    Name: prefix + name
  };
  return ssm.deleteParameterAsync(req)
}

var processBatch=(keys)=>{
    let req={
      Names: keys,
      WithDecryption: true
    };
    return ssm.getParametersAsync(req)
}

var setObjVariables=(obj,datas)=>{
  datas.forEach( (data)=>{
    data.Parameters.forEach( (p)=>{
      var arr = p.Name.split('/')
      var envName = arr[ arr.length-1 ]
      obj[ envName ] = p.Value
    })
  })
}
var modifyObj=(obj,vars,prefix)=>{
  if (!vars){
    vars=Object.keys(obj)
  }

  var keys = vars.map( (v)=> prefix + v )
  var paramRequests = []
  return new Promise( (resolve,reject)=>{
    var cachedData = cache.getData("kms")
    if (cachedData){
      setObjVariables(obj,cachedData)
      resolve(obj)
    }
    else
    {
      var subset=keys.splice(0,BATCH_SIZE)
      while (subset.length>0){
        paramRequests.push( processBatch(subset) )
        subset=keys.splice(0,BATCH_SIZE)
      }
      Promise.all(paramRequests).then((datas)=>{
        setObjVariables(obj,datas)
        cache.setData("kms",datas,3600) // Store KMS Data for 1 hour
        resolve(obj)
      }).catch((err)=>{
        reject(err)
      })
    }
  } )
}


var promiseToModifyObject = (obj,vars,prefix)=>{
  return ()=>{
    return modifyObj(obj,vars,prefix)
  }
}


module.exports = {
  putParameter : putParameter,
  getParameter : getParameter,
  deleteParameter : deleteParameter,
  setObjVariables:setObjVariables,
  modifyObj : modifyObj,
  promiseToModifyObject : promiseToModifyObject
};
