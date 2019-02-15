var db;
if(localStorage['view_ankets']) db = JSON.parse(localStorage['view_ankets']);
else db = [];

function run_view(callback, max){
	$this = $(this);
	var count = 0;
	var offset = 0;
	function go_view(offset, limit){
	 $.get('https://www.mamba.ru/api/search', {'offset': offset, 'limit': limit}, function(data){
	   $.each(data.items, function(i, val){
	      if(db.indexOf(val.aid) == -1 && count<max){
	        count++;
	        $.get('https://www.mamba.ru/mb'+val.aid, {}, function(data){
	          db.push(val.aid);
	          localStorage['view_ankets'] = JSON.stringify(db);
	          $this.html('Visits ('+count+'/'+max+')');
	        });
	      }
	   });
	   if(count==max){
	      console.log(count+' из '+max);
	      return false;
	    } 
	    else{
	      console.log('не хватает '+(max-count));
	      go_view((Number(offset)+Number(max)), max-count);
	    }
	 },'json');
	}
	go_view(0, max);
	callback('ok');
}

/* messages */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	switch(request.action){
		case 'run_view':
				run_view(sendResponse, request.max);
			break;
	}
	return true;
});