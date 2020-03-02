//**************************************************************************************
// Function: initZorgkaartNL( s )
//
// --> Initialize ZorgkaartNL Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initZorgkaartNL( s ) {
  s.setName( 'Zorgkaart.nl' );
  s.setBaseURL( 'https://www.zorgkaartnederland.nl' );
  s.setnextPageRegEx( /<a href="(.*)" title="Pagina \d+">/ );
  s.setStartURL( ZorgkaartNLComposeURL );
  s.setCheckCol( 'googleurl' );
  s.setExec1( ZorgkaartNLExecPass1 );
  s.setExec2( ZorgkaartNLExecPass2 );
  return( true );
}


//**************************************************************************************
// Function: ZorgkaartNLComposeURL( baseURL, keyword, geomodifier, radius, stars, type )
//
// --> Compose the start URL to start searching
//
//**************************************************************************************
function ZorgkaartNLComposeURL( baseURL, keyword, geomodifier, radius, stars, type ) {
  return( baseURL + '/?zoekterm=' + keyword + '+' + geomodifier );
}


//**************************************************************************************
// Function: ZorgkaartNLExecPass1()
//
// --> Starts the scraping pass1 for Zorgkaart.nl
//**************************************************************************************
function ZorgkaartNLExecPass1( s, rawurl ) {
  var regExp_url     = /<a href="\/zorginstelling\/(.*)">(.*)<\/a>/g;
  var results = [];
  
  Logger.log(" >> ZorgkaartNL pass 1" );
  
  var url = rawurl.replace("&amp;", "&" );
  
  var html = getHTMLPage( url );
  
  if ( html == null ) { 
    return;
  }
    
  while ( results = regExp_url.exec(html) ) {
    var name = results[2];
    name = name.replace(/^\s+|\s+$/g,'');
    name = name.replace(/\&amp;/g,'&');
    name = name.replace(/\&quot;/g,'"');
    
    //#Logger.log(" Found: " + name );  
    
    var url  = s.scrape.baseURL + '/zorginstelling/' + results[1];
    
    //#Logger.log("  Now scraping: " + url );
    
    //* Avoid duplicates, then add record
    if ( s.db.getRecordByKey( url ) == null ) {
      var r = new Record( s.db.fields );
      
      //#Logger.log("Found new : " + name );
      r.setFieldValue( 'name', name, s.db.fieldindex );
      r.setFieldValue( 'locationURL', url, s.db.fieldindex );
      r.setFieldValue( 'keyword', s.settings.search['keyword'], s.db.fieldindex );
      
      //#Logger.log( "R = " + JSON.stringify(r) );
      
      s.db.appendRecord( r );
    }
  }
}


//**************************************************************************************
// Function: ZorgkaartNLExecPass2()
//
// --> Starts the scraping pass1 for ZorgkaartNL
//**************************************************************************************
function ZorgkaartNLExecPass2( s, r ) {
  
  var url  = r.fieldvalue[ s.db.fieldindex[ 'locationurl' ] ];
  
  var html = getHTMLPage( url );
  
  Logger.log( 'Getting URL ' + url );
  
  var regExp_street  = /<meta property="business:contact_data:street_address" content="(.*?)" \/>/g;
  var regExp_zipcode = /<meta property="business:contact_data:postal_code" content="(.*?)" \/>/g;
  var regExp_city    = /<meta property="business:contact_data:locality" content="(.*?)" \/>/g;
  var regExp_website = /<span class="address_content"><a itemprop="url" href="(.*?)" /g;
  var regExp_phone   = /itemprop="telephone">(.*)<\/span>/g;
    
  var street  = '';
  var zipcode = '';
  var city    = '';
  var website = '';
  var phone   = '';
    
  try { street  = regExp_street.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
  try { zipcode = regExp_zipcode.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
  try { city    = regExp_city.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
  try { website = regExp_website.exec(html)[1]; } catch (err) { Logger.log( err ); }
  try { phone   = regExp_phone.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
    
  street = street.replace(/^\s+|\s+$/g,'');
  zipcode = zipcode.replace(/^\s+|\s+$/g,'');
  city = city.replace(/^\s+|\s+$/g,'');
  phone = phone.replace(/^\s+|\s+$/g,'');
  website = website.replace(/^\s+|\s+$/g,'');
  
  var googleURL = 'https://www.google.com/search?q=' + r.fieldvalue[ s.db.fieldindex[ 'name' ]].replace(/\&/g,' en ') ;
  
  if ( street != '' ) { googleURL = googleURL + '+' + street; }
  if ( zipcode != '' ) { googleURL = googleURL + '+' + zipcode; }
  if ( city != '' ) { googleURL = googleURL + '+' + city; }
  
  googleURL = googleURL.replace(/\s/g,'+') + '&hl=nl';
  
  r.setFieldValue( 'street', street, s.db.fieldindex );
  r.setFieldValue( 'zipcode', "'" + zipcode, s.db.fieldindex );
  r.setFieldValue( 'city', city, s.db.fieldindex );
  r.setFieldValue( 'phone', phone, s.db.fieldindex );
  r.setFieldValue( 'website', website, s.db.fieldindex );
  r.setFieldValue( 'country', 'Nederland', s.db.fieldindex );
  
  r.setFieldValue( 'googleurl', googleURL, s.db.fieldindex );
  
  s.db.updateRecord( r.index );
    
  try { regExp_street.lastIndex = 0; } catch ( err ) {}
  try { regExp_website.lastIndex = 0; } catch ( err ) {}
  try { regExp_zipcode.lastIndex = 0; } catch ( err ) {}
  try { regExp_city.lastIndex = 0; } catch ( err ) {}
  try { regExp_phone.lastIndex = 0; } catch ( err ) {}
  
}