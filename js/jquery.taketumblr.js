/*
/*
 * jQuery TakeTumblr
 *
 * Simplified BSD License (@see License)
 * @author        Keith Collins
 * @copyright     (c) 2013 Keith Collins
 * @version 0.0.1
 * @requires jQuery
 */
(function( $ ){
	var defaults = {
		api_key : null,
		tumblr_host : null,
		tag: null,
		text_chars: 500,
		sortby: null
	};
		
	var methods = {
    init : function( options ) { 
			// get div element
			var $div = this,
				$this = $(this),
				data = $this.data('taketumblr');
			// merge settings, options, defaults
			var settings = $.extend(true, {}, defaults);
			if (typeof options === 'object') {
				$.extend(true, settings, options);
			};
			// namespace data into one object literal (data)
			$div.data('taketumblr', {
				target : $(this),
				settings : settings,
			});
			// get going
			$div.taketumblr('_getTumblrPosts');					
		},
		
		/* get posts by tag */
		
		_getTumblrPosts: function() {
			var $this = this,
				data = this.data('taketumblr'),
				tumblr_posts = new Array(),
				$post_div,
				t_url = 'http://api.tumblr.com/v2/blog/'+data.settings.tumblr_host+'/posts?api_key='+data.settings.api_key+'&jsonp=?&callback=?&tag='+data.settings.tag,
				jxhr = [];
			
			this.empty().addClass('div-loading');
			
			$.getJSON(t_url, function(d) {
				
				tposts = d.response;
				tposts = tposts.posts;
				
				$.each(tposts, function(index, value) {
					
					var post_date = $this.taketumblr('_parseDate', value.date.substr(0,10)),
						t_url = value.post_url,
						note_count = value.note_count,
						t_title,
						t_desc,
						fb_likes = 0,
						tweets = 0;
					
					switch (value.type) {
			    	case 'link':
			    		t_title = value.title;
			      	t_desc = value.description;
							// only reset url for link posts
							t_url = value.url;
							break;
						case 'text':
			    		t_title = value.title;
			      	t_desc = value.body.substr(0,500)+'…';
			      	break;
						case 'audio' || 'video':
			    		t_title = $this.taketumblr('_strip',value.caption);
			      	t_desc = (value.player[0].embed_code) ? value.player[0].embed_code : value.player;
			      	break;
						case 'photo':
			    		t_title = 'Photos: '+$this.taketumblr('_strip',value.caption);
			      	t_desc = '<a class="clip-title-link" href="'+value.post_url+'"><img src="'+value.photos[0].alt_sizes[0].url+'" width="100%"></a>';
			      	break;
			      default:
			      	t_title = value.title;
			      	t_desc = value.body;
			      	break;
					}
	
					var fburl = 'https://api.facebook.com/method/fql.query?format=json&query=select%20%20total_count%20from%20link_stat%20where%20url=%22' + t_url + '%22';
					var twurl = 'http://urls.api.twitter.com/1/urls/count.json?callback=?&url=' + t_url;				
					
					var i = index,
						post_count = tposts.length;
					
					jxhr.push(
		        $.getJSON(fburl, function (da) {
		        	fb_likes = Math.abs(da[0].total_count);
		        })
			    );
	
					jxhr.push(
		        $.getJSON(twurl, function (db) {
		        	tweets = Math.abs(db.count);
		        })
			    );
				
					$.when.apply($, jxhr).done(function() {
						tumblr_posts.push({
			        'fb_likes' : fb_likes,
			        'tweets' : tweets,
			        'note_count' : note_count,
			        'popularity' : fb_likes + tweets + note_count,
			        'date' : post_date,
			        'tag' : data.settings.tag,
			        'title' : t_title,
			        'url' : t_url,
			        'desc' : t_desc
						});
						// once all posts are loaded into array, append to div
						if (i + 1 == post_count) {
							if (data.settings.sortby) {
								tumblr_posts.sort($this.taketumblr('_dynamicSort', data.settings.sortby));
							}
													
							$this.empty();
							
							$.each(tumblr_posts, function(i, v) {
								
								$post_div = $('<div class="post-div t-'+v.tag+'" />');
								
								var p_popular = (v.popularity > 0) ? '<p class="clip-shares">'+v.fb_likes+' likes + '+v.tweets+' tweets + '+v.note_count+' notes = '+v.popularity+'</p>' : '';
								
								$post_div.append(
									'<p class="clip-title"><a class="clip-title-link" href="'+v.url+'">'+v.title+'</a></p>'+
									'<p class="clip-date">'+v.date+'</p>'+
									'<p class="clip-desc">'+v.desc+'</p>'+
									p_popular
								);
								$this.removeClass('div-loading').hide().append($post_div).fadeIn('300');
							});
						}
					});
				});
			});
		},

		_strip: function(html) {
			var $this = this,
				data = this.data('taketumblr');
				tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			return tmp.textContent||tmp.innerText;
		},
	
		_dynamicSort: function(property) {
			var $this = this,
				data = this.data('taketumblr');
		    sortOrder = 1;
		    if(property[0] === "-") {
		        sortOrder = -1;
		        property = property.substr(1, property.length - 1);
		    }
		    return function (a,b) {
		        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		        return result * sortOrder;
		    }
		},
	
		_parseDate: function(input) {
			var $this = this,
				data = this.data('taketumblr');
		  	parts = input.split('-');
		  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
		  return parts[1]+'/'+parts[2]+'/'+parts[0]; // months are 0-based
		}
	};

	$.fn.taketumblr = function(method) {
		// Method calling logic
	    if ( methods[method] ) {
	    	return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	    	return methods.init.apply( this, arguments );
	    } else {
	    	$.error( 'Method ' +  method + ' does not exist on jQuery.taketumblr' );
	    }    	
    };
})( jQuery );