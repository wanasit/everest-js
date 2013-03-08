


$(function() {
  
  //TABS
  function reloadtabs(){
    
    var hash = document.location.hash;
    var example = hash.substring(1);
    if(hash == '') example = 'findnotes-example'
     
    $('.container .tabs>li>a').removeClass('active');
    $('.container .content').removeClass('active');
    $('.container .'+example).addClass('active');
  }
  
  window.onhashchange = reloadtabs;
  reloadtabs();
  
  //
  $('.account .logout').click(function() {
    
    $.getJSON('/logout', function (user) {
      window.location = '/';
    });
    
    return false;
  })
  
  
  //------------------------- Get User - example -------------------------
  
  //example_getUser.js
  exampleGetUser(function(err, user) {
    if(err) {
      alert('Invalid Authentication')
      window.location = '/';
    }else{
      $('#username').text(user.username)
    }
  })
  
  //------------------------- Find Notes - example -------------------------
  
  function reloadNotes(value){
    
	  //example_findNotes.js
	  exampleFindNotes(value, function(err,noteList) {  
		  if(err) return null;
		  
		  $('.findnotes-example ul').html('');
		  for(var i in noteList.notes){
		    var note = noteList.notes[i]
		    $('.findnotes-example ul').append('<li>'+note.title+'</li>')
		  }
		})
	}
  
  reloadNotes('');
  $(".findnotes-example input[type=text]").live('keyup', function () {
	    var value=$(".findnotes-example input[type=text]").val();
	    setTimeout(function(){
				if ($(".findnotes-example input[type=text]").val() == value) {
					
					//example_findNotes.js
					reloadNotes(value);
				}
	    },500);
	});
	
	//------------------------- Create Note - example -------------------------
	
  $(".create-example>a").click(function () {
    
    var title=$(".create-example input[type=text]").val();
    var content=$(".create-example textarea").val();
    
    if(!confirm('Do you want to create note "'+title+'"')) return;
    
    exampleCreateNote(title,content,function(err, note) {
      if(note) alert('"'+title+'" is created')
      else alert('ERROR')
      
      $(".create-example input[type=text]").val('')
      content=$(".create-example textarea").val('')
    })
	});
  
})