
const _LIKE_MODE = 0; // 0 = allow all, 1 = whitelist, 2 = blacklist

const whitelist = ['lambe_turah',
				   'katakitaig',
				  'infodepok_id',
				  'mediadepok.co'
				 ];
				 
const blacklist = ['lambe_turah',
				  'infodepok_id',
				  'mediadepok.co'
				 ];
	
function isWhiteList(acc){

	for(var i=0; i<whitelist.length; i++){
		if(acc == whitelist[i]){
			return true;
		}
	}
	
	return false;
}

function isBlackList(acc){

	for(var i=0; i<blacklist.length; i++){
		if(acc == blacklist[i]){
			return true;
		}
	}
	return false;
}

	
function isAllowToLike(acc){

	if(_LIKE_MODE == 0) { 
		// allow all
		return true; 
	}

	if(_LIKE_MODE == 1){
		
		return isWhiteList(acc);
	}

	// default;
    return !isBlackList(acc);
}	