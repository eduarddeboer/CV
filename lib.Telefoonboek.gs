//**************************************************************************************
// Function: initTelefoonboek( s )
//
// --> Initialize Telefoonboek Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initTelefoonboek( s ) {
  s.setName( 'Telefoonboek.nl' );
  s.setBaseURL( 'https://www.telefoonboek.nl' );
  s.setnextPageRegEx( /class="volgendeLink" href="(.*)"/ );
  s.setStartURL( TelefoonboekComposeURL );
  s.setCheckCol( 'googleurl' );
  s.setExec1( TelefoonboekExecPass1 );
  s.setExec2( TelefoonboekExecPass2 );
  return( true );
}


//**************************************************************************************
// Function: TelefoonboekComposeURL( baseURL, keyword, geomodifier, radius, stars, type )
//
// --> Compose the start URL to start searching
//
//**************************************************************************************
function TelefoonboekComposeURL( baseURL, keyword, geomodifier, radius, stars, type ) {
  return( baseURL + '/zoeken/' + keyword + '/' + geomodifier + '/' );
}


//**************************************************************************************
// Function: TelefoonboekExecPass1()
//
// --> Starts the scraping pass1 for Teelfoonboek.nl
//**************************************************************************************
function TelefoonboekExecPass1( s, url ) {
  var regExp_url     = /<a class="title-link" title="(.*)" class="name" href="\/bedrijven\/(.*)">/g;
  var results = [];
  
  var html = getHTMLPage( url );
  
  if ( html == null ) { 
    return;
  }
    
  while ( results = regExp_url.exec(html) ) {
    var name = results[1];
    name = name.replace(/^\s+|\s+$/g,'');
    var url  = s.scrape.baseURL + '/bedrijven/' + results[2];
    
    //* Avoid duplicates, then add record
    if ( s.db.getRecordByKey( url ) == null ) {
      var r = new Record( s.db.fields );
      
      Logger.log("Found new : " + name );
      r.setFieldValue( 'name', name, s.db.fieldindex );
      r.setFieldValue( 'locationURL', url, s.db.fieldindex );
      r.setFieldValue( 'keyword', s.settings.search['keyword'], s.db.fieldindex );
      
      //#Logger.log( "R = " + JSON.stringify(r) );
      
      s.db.appendRecord( r );
    }
  }
}


//**************************************************************************************
// Function: TelefoonboekExecPass2()
//
// --> Starts the scraping pass1 for Telefoonboek
//**************************************************************************************
function TelefoonboekExecPass2( s, r ) {
  
  var url  = r.fieldvalue[ s.db.fieldindex[ 'locationurl' ] ];
  
  var html = getHTMLPage( url );
  
  Logger.log( 'Getting URL ' + url );
  
  var regExp_street  = /<span itemprop="streetAddress">\s*(.*)\s*\w*<\/span>/g;
  var regExp_zipcode = /<span itemprop="postalCode">\s*(.*)\s*<\/span>/g;
  var regExp_city    = /<span itemprop="addressLocality">\s*(.*)\s*<\/span>/g;
  var regExp_website = /<meta itemprop="url" content="?(.*)"/g;
  var regExp_phone   = /itemprop="telephone">\s*<strong>(.*)\s*<\/strong>/g;
    
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