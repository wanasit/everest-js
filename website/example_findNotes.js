function exampleFindNotes(keyword,callback){
  
  $.getJSON('/notes?count=10&words='+keyword, function (noteList) {
    
    if(noteList) return callback(null, noteList);
    return callback(true, null);
  });
}