chrome.storage.local.get('Mess', function (result) {
  var res = result.Mess;
  
  document.getElementById('Mess').value = res;
  
});

document.getElementById('saveMess').onclick = function() {
  
  chrome.storage.local.set({'Mess': document.getElementById('Mess').value});
  
}



document.getElementById('startView').onclick = function() {
	var max = $('#countView').val();
	chrome.tabs.getSelected(null, function(tab) {
	  	chrome.runtime.sendMessage({action:'run_view', max: max},function(options){
			if(options=='ok') $('#startView').html('Visits (OK)');
		});
	});
  
}
