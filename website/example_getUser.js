
function exampleGetUser(callback){
  
  $.getJSON('/me', function (user) {
    
    if(user) return callback(null, user);
    return callback(true, null);
  
  }).error(function() {
    return callback(true, null);
  });
}