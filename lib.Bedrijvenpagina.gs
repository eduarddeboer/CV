//**************************************************************************************
// Function: initBedrijvenpagina( s )
//
// --> Initialize Telefoonboek Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initBedrijvenpagina( s ) {
  s.setName( 'Bedrijvenpagina.nl' );
  s.setBaseURL( 'https://www.bedrijvenpagina.nl' );
  s.setnextPageRegEx( /<a href="(.*)"><span class="fa fa-caret-right" aria-hidden="true"><\/span> Volgende<\/a>/ );
  s.setStartURL( BedrijvenpaginaComposeURL );
  s.setCheckCol( 'googleurl' );
  s.setExec1( BedrijvenpaginaExecPass1 );
  s.setExec2( BedrijvenpaginaExecPass2 );
  return( true );
}


//**************************************************************************************
// Function: BedrijvenpaginaComposeURL( baseURL, keyword, geomodifier, radius, stars, type )
//
// --> Compose the start URL to start searching
//
//**************************************************************************************
function BedrijvenpaginaComposeURL( baseURL, keyword, geomodifier, radius, stars, type ) {
  return( baseURL + '/zoek/' + keyword + '/' + geomodifier + '/' );
}


//**************************************************************************************
// Function: BedrijvenpaginaExecPass1()
//
// --> Starts the scraping pass1 for Bedrijvenpagina.nl
//**************************************************************************************
function BedrijvenpaginaExecPass1( s, url ) {
  var regExp_url     = /<h3 class="fn org"><a href="(.*)"><span itemprop="name">(.*)<\/span><\/a><\/h3>/g;
  var results = [];
  
  Logger.log(" >> Bedrijvenpagina pass 1" );
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
    
    var url  = s.scrape.baseURL + results[1];
    
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
// Function: BedrijvenpaginaExecPass2()
//
// --> Starts the scraping pass1 for Bedrijvenpagina
//**************************************************************************************
function BedrijvenpaginaExecPass2( s, r ) {
  
  var url  = r.fieldvalue[ s.db.fieldindex[ 'locationurl' ] ];
  
  var html = getHTMLPage( url );
  
  Logger.log( 'Getting URL ' + url );
  
  var regExp_street  = /itemprop="streetAddress">(.*)<\/span>/g;
  var regExp_zipcode = /itemprop="postalCode">(.*)<\/span>/g;
  var regExp_city    = /itemprop="addressLocality">(.*)<\/span>/g;
  //var regExp_website = /<meta itemprop="url" content="?(.*)"/g;
  var regExp_phone   = /itemprop="telephone">(.*)<\/span>/g;
    
  var street  = '';
  var zipcode = '';
  var city    = '';
  var website = '';
  var phone   = '';
    
  try { street  = regExp_street.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
  try { zipcode = regExp_zipcode.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
  try { city    = regExp_city.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
  //#try { website = regExp_website.exec(html)[1]; } catch (err) { Logger.log( err ); }
  try { phone   = regExp_phone.exec(html)[1]; } catch ( err ) { Logger.log( err ); }
    
  street = street.replace(/^\s+|\s+$/g,'');
  zipcode = zipcode.replace(/^\s+|\s+$/g,'');
  city = city.replace(/^\s+|\s+$/g,'');
  phone = phone.replace(/^\s+|\s+$/g,'');
  //#website = website.replace(/^\s+|\s+$/g,'');
  
  var googleURL = 'https://www.google.com/search?q=' + r.fieldvalue[ s.db.fieldindex[ 'name' ]].replace(/\&/g,' en ') ;
  
  if ( street != '' ) { googleURL = googleURL + '+' + street; }
  if ( zipcode != '' ) { googleURL = googleURL + '+' + zipcode; }
  if ( city != '' ) { googleURL = googleURL + '+' + city; }
  
  googleURL = googleURL.replace(/\s/g,'+') + '&hl=nl';
  
  r.setFieldValue( 'street', street, s.db.fieldindex );
  r.setFieldValue( 'zipcode', "'" + zipcode, s.db.fieldindex );
  r.setFieldValue( 'city', city, s.db.fieldindex );
  r.setFieldValue( 'phone', phone, s.db.fieldindex );
  //#r.setFieldValue( 'website', website, s.db.fieldindex );
  r.setFieldValue( 'country', 'Nederland', s.db.fieldindex );
  
  r.setFieldValue( 'googleurl', googleURL, s.db.fieldindex );
  
  s.db.updateRecord( r.index );
    
  try { regExp_street.lastIndex = 0; } catch ( err ) {}
  //#try { regExp_website.lastIndex = 0; } catch ( err ) {}
  try { regExp_zipcode.lastIndex = 0; } catch ( err ) {}
  try { regExp_city.lastIndex = 0; } catch ( err ) {}
  try { regExp_phone.lastIndex = 0; } catch ( err ) {}
  
}