//**************************************************************************************
// Function: initBooking( s )
//
// --> Initialize Booking Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initBooking( s ) {
  s.setName( 'Booking.com' );
  s.setBaseURL( 'https://www.booking.com' );
  s.setnextPageRegEx( /href="(.*)" .* title="Volgende pagina">/g );
  s.setStartURL( BookingComposeURL );
  s.setCheckCol( 'country' );
  s.setExec1( BookingExecPass1 );
  s.setExec2( BookingExecPass2 );
  return( true );
}


//**************************************************************************************
// Function: BookingComposeURL( baseURL, keyword, geomodifier, radius, stars, type )
//
// --> Compose the start URL to start searching
//
//**************************************************************************************
function BookingComposeURL( baseURL, keyword, geomodifier, radius, stars, type ) {
  
  var searchURL = baseURL + '/searchresults.nl.html?ss=' + geomodifier;
  
  //#Logger.log( "In BookingComposeURL" );
  
  if ( stars != undefined && stars != '' ) { searchURL = searchURL + '&class=' + stars; }
  if ( type  != undefined && type  != '' ) { searchURL = searchURL + '&nflt=ht_id%3D' + type + '%3B'; }
  
  //#Logger.log( 'SearchURL = ' + searchURL );
  return( searchURL );
}


//**************************************************************************************
// Function: BookingExecPass1()
//
// --> Starts the scraping pass1 for booking
//**************************************************************************************
function BookingExecPass1( s, url ) {
  
  var regExp_url     = /class="hotel_name_link url"\s+href="\s+(.*)\?label=/g;
  var regExp_name    = /<span class="sr-hotel__name\s+"[a-zA-Z0-9\s\"=\-:]+>\s+(.*)\s+<\/span>/g;  
  var results = [];
  
  var html = getHTMLPage( url );
  
  if ( html == null ) { 
    return;
  }
    
  while ( results = regExp_url.exec(html) ) {
    var name = regExp_name.exec( html );
    if ( name != null ) {
      name = name[1];
      //#Logger.log(" Found : " + name );
      name = name.replace(/^\s+|\s+$/g,'');
      name = name.replace(/\&#39;/g,"'" );
      name = name.replace(/&amp;/g, '&' );
      name = name.replace(/&#47;/g, '&' );
    }
    
    var url  = s.scrape.baseURL + results[1];
    
    //* Avoid duplicates, then add record
    if ( s.db.getRecordByKey( url ) == null ) {
      var r = new Record( s.db.fields );
      
      //#Logger.log("Found new : " + name );
      r.setFieldValue( 'name', name, s.db.fieldindex );
      r.setFieldValue( 'locationURL', url, s.db.fieldindex );
      
      s.db.appendRecord( r );
    }
  }
  
  regExp_url.lastIndex  = 0;
  regExp_name.lastIndex  = 0;
}


//**************************************************************************************
// Function: BookingExecPass2()
//
// --> Starts the scraping pass1 for booking
//**************************************************************************************
function BookingExecPass2( s, r ) {
  
  var url  = r.fieldvalue[ s.db.fieldindex[ 'locationurl' ] ];
  
  //Logger.log( "URL = " + url );
  
  var html = getHTMLPage( url );
    
  var address = '';
  var street  = '';
  var zipcode = '';
  var city    = '';
  var country = '';
  var website = '';
  var phone   = '';
    
  var regExp_country  = /"addressCountry" : "(.*)",?/g;
  try { var country = regExp_country.exec(html); } catch (err) { Logger.log( err ); }
    
  switch ( country[1] ) {
    case "IJsland" :
    case "Tanzania" :
    case "Seychellen" :
    case "Guadeloupe" :
    case "Martinique" :
    case "Jamaica" :
    case "Egypte" :
    case "Dominicaanse Republiek" :
    case "Aruba" :
    case "Bonaire" :
    case "Curaçao" :
    case "Thailand" :
    case "Cuba" :
    case "Maleisië" :
    case "Mexico" :
    case "Ghana" :
    case "Mauritius" :
    case "Kenia" : {
      var regExp_address   = /"streetAddress" : "(.*),\s*(\d+)?\s*(.*), (.*)",?/g;
      try { address = regExp_address.exec(html); } catch (err) { Logger.log( err ); }
      try { street  = address[1];  
        if ( address[2] != null ) { zipcode = address[2]; }
      } catch (err) { Logger.log( err ); }
      try { city    = address[3]; } catch (err) { Logger.log( err ); }
      break;
    }
        
    case "Barbados" : {
      var regExp_address   = /"streetAddress" : "(.*),\s*(BB\d+)?\s*(.*), (.*)",?/g;
      try { var address = regExp_address.exec(html); } catch (err) { Logger.log( err ); }
      street  = address[1];
      if ( address[2] != null ) { zipcode = address[2]; }
      city    = address[3];
      country = address[4];
      break;
    }
      
    case "Verenigd Koninkrijk" : 
    case "Spanje" : 
    case "Trinidad en Tobago" : {
      var regExp_address   = /"streetAddress" : "(.*)",?/;
      var regExp_zipcode   = /"postalCode" : "(.*)",?/;
      var regExp_city      = /"addressLocality" : "(.*)",?/;
      //var regExp_country    = /"Country" : "(.*)",?/g;
      try { var address = regExp_address.exec(html); } catch (err) { Logger.log( err ); }
      street  = address[1];
      try { var zip = regExp_zipcode.exec(html); } catch (err) { Logger.log( err ); }
      if ( zip[1] != null ) zipcode  = zip[1];
      try { var c = regExp_city.exec(html); } catch (err) { Logger.log( err ); }
      city  = c[1];
    }
        
    case "Senegal" : {
      var regExp_address   = /"streetAddress" : "(.*)",?/;
      var regExp_split     = /(.*),\s+(\d{5})\s+(.*),\s+Senegal/;
        
      try { var address = regExp_address.exec(html);
            //Logger.log( " Address : " + address[1] );
            var list = regExp_split( address[1] );
            street  = list[1];
            zipcode = list[2];
            city    = list[3];
          } catch (err) { Logger.log( err ); }
    }
        
    case "Kaapverdische Eilanden" : {
      var regExp_city    = /addressRegion" : "(.*)",?/;     // In this case not the country, but the island
      var regExp_address = /addressLocality" : "(.*)",?/;
      //var regExp_city      = /"" : "(.*)",?/;
        
      try {
            var street = regExp_address.exec(html)[1];
            var city   = regExp_city.exec(html)[1];
            
          } catch (err) { Logger.log( err ); }
    }
  }

  r.setFieldValue( 'street', street, s.db.fieldindex );
  r.setFieldValue( 'zipcode', "'" + zipcode, s.db.fieldindex );
  r.setFieldValue( 'city', city, s.db.fieldindex );
  r.setFieldValue( 'country', country[1], s.db.fieldindex );
  
  var googleURL = 'https://www.google.com/search?q=' + r.fieldvalue[ s.db.fieldindex[ 'name' ] ];
  
  if ( street != '' ) { googleURL = googleURL + '+' + street; }
  if ( zipcode != '' ) { googleURL = googleURL + '+' + zipcode; }
  if ( city != '' ) { googleURL = googleURL + '+' + city; }
  if ( country[1] != '' ) { googleURL = googleURL + '+' + country[1]; }
  
  googleURL = googleURL.replace(/\s/g,'+') + '&hl=en';
  r.setFieldValue( 'googleurl', googleURL, s.db.fieldindex );
  
  //* Update the record
  s.db.updateRecord( r.index );
    
  try { regExp_country.lastIndex = 0; } catch ( err ) {}
  try { regExp_address.lastIndex = 0; } catch ( err ) {}
  try { regExp_zipcode.lastIndex = 0; } catch ( err ) {}
  try { regExp_city.lastIndex = 0; } catch ( err ) {}
  try { regExp_split.lastIndex = 0; } catch ( err ) {}
    
  //  colorrange.setBackground("white");
  //  SpreadsheetApp.flush();
}