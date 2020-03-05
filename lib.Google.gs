//**************************************************************************************
// Function: initGoogle( s )
//
// --> Initialize Google Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initGoogle( s ) {
  s.setName( 'Google.com' );
  s.setCheckCol( 'placeid' );
  s.setExec2( GoogleExecPass2 );
  return( true );
}


//**************************************************************************************
// Function: GoogleExecPass2()
//
// --> Starts the scraping pass2 for booking
//**************************************************************************************
function GoogleExecPass2( s, r ) {
  
  var url      = r.fieldvalue[ s.db.fieldindex[ 'googleurl' ] ];
  var city     = r.fieldvalue[ s.db.fieldindex[ 'city' ] ];
  var zipcode  = r.fieldvalue[ s.db.fieldindex[ 'zipcode' ] ];
  var country  = r.fieldvalue[ s.db.fieldindex[ 'country' ] ];
  var phone    = r.fieldvalue[ s.db.fieldindex[ 'phone' ] ];
  
  var url = r.fieldvalue[ s.db.fieldindex[ 'name' ] ];  
  if ( zipcode != '' ) { url = url + '+' + zipcode; }
  if ( city != '' ) { url = url + '+' + city; }
  //if ( phone != '' ) { url = url + '+' + phone; }
  if ( country != '' ) { url = url + '+' + country; }
  
  url = url + '&hl=en';
  //url = encodeURIComponent( url );
  url = 'https://maps.google.com/?q=' + url;
  //url = 'https://www.google.com/search?q=' + url;
  
  Logger.log( "URL = " + url );
 
  var html = getHTMLPage( url );
  
  if ( html == null || html.indexOf( 'wikipedia' ) > -1 || html.indexOf( '/rap/edit' ) == -1 ) {
    r.setFieldValue( 'placeid', 'N/A', s.db.fieldindex );
    r.setFieldValue( 'mapsurl', 'N/A', s.db.fieldindex );
    s.db.updateRecord( r.index );
    return; 
  }
  
  //#Logger.log( html );
  
  var regExp_cid   = /:0x([a-f0-9]+)/;
  var regExp_phone = /\\"(\+[0-9]+)\\"/;
  
  try {
    var cid = regExp_cid.exec( html );
    //#Logger.log( "CID = " + cid[1] );
  } catch (err) { Logger.log( err ); }
  
  try {
    var phone = regExp_phone.exec( html );
    //#Logger.log( "phone = " + phone[1] );
  } catch (err) { Logger.log( err ); }
     
  //* Update the record
  r.setFieldValue( 'placeid', 'N/A', s.db.fieldindex );
  if ( cid != null && cid[1] != null ) {
    var newcid = h2d(cid[1]);
    r.setFieldValue( 'placeid', newcid, s.db.fieldindex );
    
    if ( phone != null ) {
      r.setFieldValue( 'phone', phone[1], s.db.fieldindex );
    }
    
    r.setFieldValue( 'mapsurl', 'https://www.google.com/maps?cid=' + newcid, s.db.fieldindex );
  }
  
  //* 20200305 Newly added to see whether this works, too ... Can save one pass :-)
  //* Check whether business has been claimed
    if ( html != null && html.indexOf( 'Claim this business' ) === -1 ) {
      r.setFieldValue( 'claimed', 'Yes', s.db.fieldindex ); // Business has been claimed
    }  
    else { 
      r.setFieldValue( 'claimed', 'No', s.db.fieldindex ); // Business has not been claimed
    }
      
    //* Check for Street View / 360 photography
    if ( html != null && (html.indexOf( 'photos:street_view_publish_api' ) > -1 || html.indexOf( '360° view' ) > -1)  )  {
      if ( html.indexOf( 'photos:street_view_publish_api' ) > -1  )  {
        r.setFieldValue( 'vt', 'Yes', s.db.fieldindex );
      } else {
        r.setFieldValue( 'vt', '360', s.db.fieldindex ); // Business has Street View?
      }
    } else { 
      r.setFieldValue( 'vt', 'No', s.db.fieldindex );  // Business has no Street View
    }    
    
    //* Check for opening hours in GMB
    r.setFieldValue( 'hashours', 'Yes', s.db.fieldindex );
    if ( html != null && html.indexOf( '/rap/edit/hours' ) > -1 ) {
      r.setFieldValue( 'hashours', 'No', s.db.fieldindex ); 
    }
    
    //* Check for category in GMB
    r.setFieldValue( 'hascategory', 'Yes', s.db.fieldindex );
    if ( html != null && html.indexOf( '/rap/edit/category' ) > -1 ) {
      r.setFieldValue( 'hascategory', 'No', s.db.fieldindex ); 
    }
    
    //* Check for phone number in GMB
    r.setFieldValue( 'hasphone', 'Yes', s.db.fieldindex );
    if ( html != null && html.indexOf( '/rap/edit/phonenumber' ) > -1 ) {
      r.setFieldValue( 'hasphone', 'No', s.db.fieldindex ); 
    }
    
    //* Check the reviews
    var reviews = 0;
    var regExp_reviews = /\\"([0-9]+) reviews\\"/;
    try { reviews = regExp_reviews.exec(html); } catch (err) { Logger.log( err ); }
    if ( reviews != null ) { r.setFieldValue( 'reviews', reviews[1], s.db.fieldindex ); }
    
    //* Check Website
    var website = [];
    var regExp_website = /\/url\?q\\\\u003d(.*?)\\\\u0026sa/;
    try { website = regExp_website.exec(html); } catch (err) { Logger.log( err ); }
    if ( website != null && website[1].indexOf( 'google.com' ) == -1 && website[1].indexOf( 'http' ) > -1 ) {
      r.setFieldValue( 'website', website[1], s.db.fieldindex );
      r.setFieldValue( 'hassite', 'Yes', s.db.fieldindex );
    } else {
      r.setFieldValue( 'hassite', 'No', s.db.fieldindex );
    }
  
  //* Update the record
  s.db.updateRecord( r.index );
    
  try { regExp_cid.lastIndex = 0; } catch ( err ) {}
  
  if ( s.settings.variables['google:fetchdelay'] != null && s.settings.variables['google:fetchdelay'] != 0 ) {
    sleep( s.settings.variables['google:fetchdelay'] ); 
  }
    
}

//**************************************************************************************
// Function: GoogleCreateSearchURLs()
//
// --> Create Google Search URLs in the field "GoogleURL"
//**************************************************************************************
function GoogleCreateSearchURLs() {
  return( true );
}

//**************************************************************************************
// Function: GoogleInit()
//
// --> Initialize Google Scraper
//
// Arguments:
// - s : Scraper object
//**************************************************************************************
function GoogleInit( ) {
  return( true );
}


function h2d(s) {

    function add(x, y) {
        var c = 0, r = [];
        var x = x.split('').map(Number);
        var y = y.split('').map(Number);
        while(x.length || y.length) {
            var s = (x.pop() || 0) + (y.pop() || 0) + c;
            r.unshift(s < 10 ? s : s - 10); 
            c = s < 10 ? 0 : 1;
        }
        if(c) r.unshift(c);
        return r.join('');
    }

    var dec = '0';
    s.split('').forEach(function(chr) {
        var n = parseInt(chr, 16);
        for(var t = 8; t; t >>= 1) {
            dec = add(dec, dec);
            if(n & t) dec = add(dec, '1');
        }
    });
    return dec;
}