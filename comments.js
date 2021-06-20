const _ALLOW_COMMENT = 1; // disable or enable comments

comments = [':)',
			'^^'
			];
			
function getComment(){

	if(_ALLOW_COMMENT !=1 )  { return ''; }
	var i = Math.floor(Math.random() * comments.length);
	return comments[i];
}	