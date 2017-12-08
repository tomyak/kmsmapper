var wrapHandlerWithPromise = ( ( handler,promise ) =>{
  return (event,context,cb)=> {
    promise()
    .then( (res)=>{
      return handler(event,context,cb)
    } )
    .catch( (err)=>{
      cb(err,null)
    } );
  }
} )


var wrapModuleExportsWithPromise = (module,promise)=>{
  for(var f in module.exports){
    if (typeof(module.exports[f])==="function"){
      module.exports[f]=wrapHandlerWithPromise(module.exports[f],promise)
    }
  }
}

var wrapModuleExportsWithFunction = (module,fn)=>{
  for(var f in module.exports){
    if (typeof(module.exports[f])==="function"){
      module.exports[f]=fn(module.exports[f])
    }
  }
}

module.exports={
  wrapHandlerWithPromise:wrapHandlerWithPromise,
  wrapModuleExportsWithPromise:wrapModuleExportsWithPromise,
  wrapModuleExportsWithFunction:wrapModuleExportsWithFunction
}
