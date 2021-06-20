/*
	Instagram AutoLike And Comment - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : https://github.com/frxangelz/ig_autolike_and_comment
*/

const _MAX_LIKE_TO_RELOAD = 20;
const _TIME_TO_RELOAD = 300;		// 5 minutes

reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;

tick_count = 0;
cur_url = "test";

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}

articles = null;
NoArticlesFoundCount = 0;
elapsed_time = 0;

function DoLike(){
	
	var articles = document.getElementsByTagName('article');
	if(!articles){ 
		info('No Article Found.');
		NoArticlesFoundCount++;
		return false; }
		
	if(articles.length < 1) { 
		info('No Articel Found.');
		NoArticlesFoundCount++;
		return false; 
	}
	
	NoArticlesFoundCount = 0;
	//console.log('found Articles : '+articles.length);
	
	var found = false;

	for(var i=0; i<articles.length; i++){
	
		var acc = articles[i].querySelector('a.sqdOP');
		if(!acc) { continue; }
		
		if(!isAllowToLike(acc.textContent)){
				
			//console.log(acc.textContent+' is not allowed');
			continue;
		}
		
		var sec = articles[i].querySelector('section.Slqrh');
		if(!sec) { continue; }
		
		var like = sec.querySelectorAll('svg._8-yf5 ');
		if(!like) { continue; }
		if(like.length < 1) { continue; }

		for (var j=0; j<like.length; j++){

			if(like[j].getAttribute('aria-label') == 'Like') {
				config.total++;
				like[j].scrollIntoView();
				like[j].parentNode.click();
				found = true;
				break;
			}
		}

		if(found) { 
		
			chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status === false) { config.enable = 0; }
			});	
		
			posComment(articles[i]);
			break; 
		}
		
	};
	
	// scroll down to last article
	if(!found){	articles[articles.length-1].scrollIntoView(); }
	return false;
}

function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}
	
function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	info.textContent = "Liked : "+config.total+", "+txt;
}

function setNativeValue(element, value) {
      const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {}
      const prototype = Object.getPrototypeOf(element)
      const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {}

      if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value)
      } else if (valueSetter) {
        valueSetter.call(element, value)
      } else {
        //throw new Error('The given element does not have a value setter')
		return false;
      }
	  
	  return true;
}

// fill textarea -> o (textarea object)
function setComment(o,text){

  o.scrollIntoView();
  if (!setNativeValue(o, text)) { return false; }
  o.dispatchEvent(new Event('input', { bubbles: true }))
  return true;
}

function posComment(article){
	
	var cmt = getComment(); // comments.js
	if(cmt == '') { return; }
	
	var ta = article.getElementsByTagName('textarea');
	if(!ta) { return; }
	if(ta.length < 1) { return; }

	if(!setComment(ta[0], cmt)) { return; }
	
	// find post button
	var btns =  article.getElementsByTagName('button');
	for(var i=0; i<btns.length; i++){
		if(btns[i].textContent == 'Post') {
			btns[i].click();
			console.log("posted !");
			break;
		}
	}
}
	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			config.total = 0;
			overlimit = false;
			first = true;
		}
	}
});
 
    chrome.extension.sendMessage({}, function(response) {
    
	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
					config.max = response.max;
					config.chance = response.chance;
					config.interval = response.interval;
					
					r_interval = get_random(config.interval,config.chance); 
				});
		   }
		   
		   cur_url = $(location).attr('href');		   
           tick_count= tick_count+1; 

		   if((config.enable == 1) && (cur_url.indexOf('instagram.com') !== -1) && (config.total < config.max)){

				elapsed_time++;
				if(elapsed_time >= _TIME_TO_RELOAD){
					window.location.href=cur_url;
					return;
				}
				
				show_info();
		   
				if(config.total >= _MAX_LIKE_TO_RELOAD){ window.location.href=cur_url; return; }

				if(NoArticlesFoundCount >= 3){
						window.location.href=cur_url;
						return;
				}
				
				if (overlimit) {
				
					if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
					return;
				}
			   
				if(no_buttons) {

					if(tick_count > 30){
			
						console.log("No Button, Reload");
						window.location.href=cur_url;
					} else {
						var c = 30 - tick_count;
						info("Waiting For "+c+" seconds to reload");
					}
		
					return;
				}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					DoLike();
					if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); return; }
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
				
		   } else {
			console.log('tick disable');
		   }

	   }
	}, 1000);
	
});

