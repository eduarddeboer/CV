//**************************************************************************************
// Function: initGoogleMaps( s )
//
// --> Initialize Google Maps Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initGoogleMaps( s ) {
  s.setName( 'GoogleMaps.com' );
  s.setCheckCol( 'claimed' );
  s.setExec2( GoogleMapsExecPass2 );
  return( true );
}


//**************************************************************************************
// Function: GoogleMapsExecPass2()
//
// --> Starts the scraping pass1 for booking
//**************************************************************************************
function GoogleMapsExecPass2( s, r ) {
  
  var url      = r.fieldvalue[ s.db.fieldindex[ 'mapsurl' ] ];
  
  if ( url == 'N/A' || url == '' ) {
    r.setFieldValue( 'claimed', 'N/A', s.db.fieldindex ); // Business does not exist
  } else {
    var html = getHTMLPage( url );

    if ( html.indexOf( 'Claim this business' ) === -1 ) {
      r.setFieldValue( 'claimed', 'Yes', s.db.fieldindex ); // Business has been claimed
    }  
    else { 
      r.setFieldValue( 'claimed', 'No', s.db.fieldindex ); // Business has not been claimed
    }
      
    if ( html.indexOf( 'photos:street_view_publish_api' ) > -1 || html.indexOf( '360° view' ) > -1  )  {
      if ( html.indexOf( 'photos:street_view_publish_api' ) > -1  )  {
        r.setFieldValue( 'vt', 'Yes', s.db.fieldindex );
      } else {
        r.setFieldValue( 'vt', '360', s.db.fieldindex ); // Business has Street View?
      }
    } else { 
      r.setFieldValue( 'vt', 'No', s.db.fieldindex );  // Business has no Street View
    }    
    
    r.setFieldValue( 'hashours', 'Yes', s.db.fieldindex );
    if ( html.indexOf( '/rap/edit/hours' ) > -1 ) {
      r.setFieldValue( 'hashours', 'No', s.db.fieldindex ); 
    }
    
    r.setFieldValue( 'hascategory', 'Yes', s.db.fieldindex );
    if ( html.indexOf( '/rap/edit/category' ) > -1 ) {
      r.setFieldValue( 'hascategory', 'No', s.db.fieldindex ); 
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
    
    
  }

  //* Update the record
  s.db.updateRecord( r.index );
  
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