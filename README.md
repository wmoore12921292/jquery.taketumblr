jquery.taketumblr
================

TakeTumblr: jQuery plugin to get Tumblr posts by tag and display them on your site.

Specify an API key, a tag, and what field to sort by, and you're off. The plugin will get the URL, title, date, and description of each post. It also checks each post's Facebook likes and shares, tweets, and Tumblr notes to create a sortable popularity field.

POST TYPES:

TakeTumblr can currently take these types of posts: text, links, photo, audio, video. I don't use the other types of posts, like chats or quotes, but they would be pretty easy to add if you'd like to add them. 

USAGE: 

See demo.html

OPTIONS:

'api_key'
Default: null

You'll need to get an API key from Tumblr specific to your blog. Just go here: 
http://www.tumblr.com/oauth/apps

'tag'
Default: null

Specify the tag you want to pull posts by. 

'text_chars'
Default: 500

Specify the number of characters to allow for the body of the posts. Make null to bring in the full text. If the amount of text in the post exceeds the number you put here, the string will be appended with ellipses. 

'sortby'
Default: null

You can sort by any of the following fields:
'fb_likes'
'tweets'
'note_count'
'popularity'
'date'
'tag'
'title'
'url'
'desc'

Add a minus sign before the field to sort descending. Example:
'sortby' : '-popularity'


