
function exampleCreateNote(title,content, callback){
  
  var note = {
    title:title,
    content:enml.ENMLOfPlainText(content)
  }
  
  $.post('/notes',note, function (note) {
    if(note) return callback(null, note);
    return callback(true, null);
  });
}