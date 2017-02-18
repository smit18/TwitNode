# TwitNode
TwitSmit Analyser

A Twitter tool to calculate the best time to tweet

Enter Twitter User Name or UserID to know the best time to tweet.
The result will be shown as 15 minute interval time. (i.e 4.00 AM, 4.15 AM, 12:30 PM... ) 

The calculation for the time is based on the the user's last post by which the activities of user's followers are tracked.
The time(s) when most of the follwers actively post are shown as the result.



eg.

================================================
Best Time to Tweet for User
   
	1:30 PM
	4:45 PM
	
================================================


No result is shown if either the user or the followers have not posted for the given day.


*************
Packages
*************
Node.js
+-- express@4.14.1
+-- jade@1.11.0
+-- twitter@1.7.0
