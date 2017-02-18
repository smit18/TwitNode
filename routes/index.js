var express = require('express');
var router = express.Router();
var Twitter = require('twitter');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'TwitSmit Analyser'});
});

/* POST to submit User Service */
router.post('/', function(req, res) {

    var userName = req.body.username;
    var userID = req.body.userid;
	var userParam = '';
	
	//Simple Field Validation
	if (userName== '' && userID == ''){
        res.render('index',{ title: 'TwitSmit Analyser', message: 'Both the fields are empty. Please fill one.'});
		return;
	}
	else 
	if (userName!= '' && userID != ''){
        res.render('index',{ title: 'TwitSmit Analyser', message: 'Please fill only one field'});
		return;
	}

		
    var client = new Twitter({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token_key: process.env.ACCESS_TOKEN_KEY,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
    });
	
    
    var window = 15; // Window of 15 minutes
    var count = 0;
	var user_last_post = '';
	var follow_count = 0;
	var flag = 0;
    var arrays = [], size = 100; // Follower limit for single API call
	var user_id_array = [];
	var v_time = '';
	var v_date = '';
	var time_dict = {};
	
	//Get data by UserName
	if (userName!= ''){
		client.get('users/lookup', { screen_name : userName}, function (err, data, response){

			//To check user exists
			if (isEmpty(data[0])){
	
				res.render('index',{ title: 'TwitSmit Analyser', message: 'Username/ID does not exit'});
				return;
			}
			
			
			//Get last tweet of the user
			client.get('statuses/user_timeline', {  screen_name : userName , count: 1}, function(error, data, response) {
	
				if (!isEmpty(data[0])){
					
					user_last_post = parseTwitterDate(data[0].created_at);
					follow_count = data[0].user.followers_count;
					
					if(follow_count == 0){
						res.render('noresults', { title: 'No Result'});
						return;
					}
					
					//Get Followers information
					var j = 0; 
					client.get('followers/ids', { screen_name : userName }, function getData(err, data, response) {
						
						if (!isEmpty(data)){
							
							// Fetch Followers List
							
							user_id_array = data.ids; 
							
							// Set flag for last iteration
							if(!(data['next_cursor'] > 0))
								flag=1;
	
							if(user_id_array == undefined)
								user_id_array=[];
															
							
							// Get list of 100 followers at a time 
							while (user_id_array.length > 0)
								arrays.push(user_id_array.splice(0, size));
					
							for (j=j;j < arrays.length; j++) {
											
								var user_id_param = arrays[j].join();
								client.get('users/lookup', { user_id: user_id_param }, getUserTweets);
					
							}
													
							// Go to next cursor if exists
							if (data['next_cursor'] > 0) client.get('followers/ids', { screen_name : userName, cursor: data['next_cursor']}, getData); 
						}
						else 
							return;
					
					});
		
				}
				else
				{
					res.render('noresults', { title: 'No Result'});
				}
			});
		});
	}
	else //Get data by UserID
	{
		client.get('users/lookup', { user_id : userID }, function (err, data, response){
			
			//To check user exists
			if (isEmpty(data[0])){
				res.render('index',{ title: 'TwitSmit Analyser', message: 'Username/ID does not exit'});
				return;
			}
			
			
			//Get last tweet of the user
			client.get('statuses/user_timeline', {  user_id : userID , count: 1}, function(error, data, response) {
				
				if (!isEmpty(data[0])){
					
					user_last_post = parseTwitterDate(data[0].created_at);
					follow_count = data[0].user.followers_count;
					
					if(follow_count == 0){
						res.render('noresults', { title: 'No Result'});
						return;
					}
					
					//Get Followers information
					var j = 0; 
					client.get('followers/ids', { user_id : userID }, function getData(err, data, response) {
						
						if (!isEmpty(data)){
							
							// Fetch Followers List
							
							user_id_array = data.ids; 
							
							// Set flag for last iteration
							if(!(data['next_cursor'] > 0))
								flag=1;
	
							if(user_id_array == undefined)
								user_id_array=[];
															
							
							// Get list of 100 followers at a time 
							while (user_id_array.length > 0)
								arrays.push(user_id_array.splice(0, size));
					
							for (j=j;j < arrays.length; j++) {
											
								var user_id_param = arrays[j].join();
								client.get('users/lookup', { user_id: user_id_param }, getUserTweets);
					
							}
													
							// Go to next cursor if exists
							if (data['next_cursor'] > 0) client.get('followers/ids', { user_id : userID, cursor: data['next_cursor']}, getData); 
						}
						else 
							return;
					
					});
		
				}
				else
				{
					res.render('noresults', { title: 'No Result'});
				}
			});
		});
	}
	
	function parseTwitterDate(text) {
        var newtext = text.replace(/(\+\S+) (.*)/, '$2 $1')
        var date = new Date(Date.parse(newtext)).toLocaleDateString();
        return date;
    }

    function parseTwitterTime(text) {

        var time_window = new Date(Date.parse(text));
        time_window.setMinutes(time_window.getMinutes() - (time_window.getMinutes() % window))
        var time = time_window.toLocaleTimeString().replace(/(.*)\D\d+/, '$1');
        return time;
    }
	
	// Function to get followers tweet data - Most Recent Tweet
    function getUserTweets(err, tweets, response) {
        
		//Set Timestamps and counts as key-value pairs
		var times = time_dict;
        count++;
		
		if (!isEmpty(tweets)){
			for (var i = 0; i < tweets.length; i++) {
	
				if (tweets[i].status != null) {
					var v_time = parseTwitterTime(tweets[i].status.created_at);
					var v_date = parseTwitterDate(tweets[i].status.created_at);
	
	
					if (v_date == user_last_post) {
	
						if (!(v_time in times))
							times[v_time] = 1;
						else
							times[v_time] = times[v_time] + 1;
	
					}
				}
			}
		}

        time_dict = times;
		
		//Last Iteration
        if ( flag==1 && count == arrays.length ) {
			
			//Get the time with most number of tweets
            
			keys = Object.keys(time_dict), largest = Math.max.apply(null, keys.map(x => time_dict[x]))
            result = keys.reduce((result, key) => {
                if (time_dict[key] === largest) {
                    result.push(key);
                }
                return result;
            }, [])
			
			if (isEmpty(result))
				res.render('noresults', { title: 'No Result'});
			else
				res.render('checktime', { title: 'Result', tweets: result});
        }

    }
	
	function isEmpty(obj) {

		// null and undefined are "empty"
		if (obj == null) return true;	
				
		// If it has a length property with a non-zero value
		if (obj.length > 0)    return false;
		if (obj.length == 0)  return true;
		
		if (typeof obj != "object") return true;
	
		

		return false;
	}
return;
});
module.exports = router;