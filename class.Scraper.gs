//**************************************************************************************
// Class: Scraper()
//
// - Contains the following fields
//   - ssID    : Spreadsheet ID
//   - MapsAPI : API key for Google Maps
//   - ss      : Spreadsheet
//   - ssName  : Name of this spreadsheet
//**************************************************************************************
function Scraper( name, db_cnf_id ) {
  this.name         = name;
  
  this.nrpages   = 0;
  this.nrrecords = 0;
  
  //* Get the settings, open the (potential remote) DB and create the Sitescraper
  this.db_cnf      = new DB( db_cnf_id, 'Settings' );
  
  //#Logger.log( this.db_cnf.sheet );
  
  this.settings    = new Settings( this.db_cnf.sheet );
  
  //#Logger.log( this.settings );  
  //#Logger.log( 'Opening data ' + this.settings.variables['destination_ssid'] );
  
  this.db          = new DB( this.settings.variables['destination_ssid'], 'Data' );
  if ( this.db.sheet == null ) {
    Logger.log( 'Sheet "Data" not found' );
    this.sheet = this.db_cnf.ss.getSheetByName('Data (Template)' ).copyTo(this.db.ss);
    this.sheet.setName( 'Data' );
    
    for (i = 0; i < this.db.ss.getSheets().length; i++) {
      switch(this.db.ss.getSheets()[i].getSheetName()) {
        case "Data":
          break;
        default:
        this.db.ss.deleteSheet(this.db.ss.getSheets()[i]);
      }
    }
    
    var sheet = this.db_cnf.ss.getSheetByName('Statistics' ).copyTo(this.db.ss);
    sheet.setName( 'Statistics' );
    
    clearData();
  }
  this.db          = new DB( this.settings.variables['destination_ssid'], 'Data' );
  this.db.nrfields = this.db.ss.getLastColumn();
  
  //* Read all the fields and records
  this.db.getFields();  
  this.db.getRecords();
  
  this.scrape   = new Sitescraper();
  
}


//**************************************************************************************
// Method: execPass1()
//
// --> Starts the scraping
//**************************************************************************************
Scraper.prototype.execPass1 = function() {
  Logger.log( 'Starting Scraper (Pass 1) ' + this.name );
  
  //* Get the settings and create sitescraper
  this.settings = new Settings( this.db_cnf.sheet ); 
  this.scrape   = new Sitescraper();
  
  //* Perform the correct init function related to scrapesite
  switch( this.settings.search['scrapesite'].toLowerCase() ) {
      
    case 'booking' :
      initBooking( this.scrape );
      Logger.log( 'Initialized Booking' );
      break;
      
    case 'telefoonboek' :
      initTelefoonboek( this.scrape );
      Logger.log( 'Initialized Telefoonboek' );
      break;
      
    case 'bedrijvenpagina' :
      initBedrijvenpagina( this.scrape );
      Logger.log( 'Initialized Bedrijvenpagina' );
      break;
      
    case 'zorgkaartnl' :
      initZorgkaartNL( this.scrape );
      Logger.log( 'Initialized ZorgkaartNL' );
      break;
      
    default :
      break;      
  }  
  
  var keyword = this.settings.search['keyword'];
  var geomod  = this.settings.search['geomodifier'];
  
  if ( keyword == "*" ) { keyword = this.settings.getNextKeyword( keyword ); }
  if ( geomod  == "*" ) { geomod  = this.settings.getNextGeomod( geomod ); }
  
  var oldkey = keyword;
  var oldgeo = geomod;

  this.settings.saveSearch();
  
  deleteTriggers();
  setTrigger( "searchLocations", 32 );
  
  //* Loop over keywords
  while ( keyword != "" ) {
    
    //* Read all the records
    this.db.getRecords();
    
    //* Loop over geomods
    while ( geomod != "" ) {      
      
      //* Read all the records
      this.db.getRecords();
      
      var url  = this.scrape.fn_startURL(
                   this.scrape.baseURL,
                   keyword,
                   geomod,
                   this.settings.search['radius'],
                   this.settings.search['stars'],
                   this.settings.search['type']
                 );
  
      this.scrape.startURL = url;

      Logger.log( 'Starting URL = >' + url + '<' );
  
      var html = getHTMLPage( url );    
      var results = [];
  
      this.scrape.fn_execpass1( this, url );
        
      // As long as there are more pages, grab them
      while ( results = this.scrape.nextPageRegEx.exec(html) ) {
    
        url = this.scrape.baseURL + results[1];
        
        Logger.log("  Fetching URL: " + url );
        html = getHTMLPage( url );
        this.nrpages++;
    
        this.scrape.nextPageRegEx.lastIndex = 0;
        this.scrape.fn_execpass1( this, url );
      } //* End while results
      
      geomod = this.settings.getNextGeomod( geomod );
      if ( (geomod == oldgeo) || (geomod == "") ) { 
        geomod = "";
      } else {
        oldgeo = geomod;
      }
      
    } //* End while geomod
    
    keyword = this.settings.getNextKeyword( keyword );
    if ( (keyword == oldkey) || (keyword == "") ) { 
      keyword = "";
    } else {
      oldkey = keyword;
      geomod = this.settings.getNextGeomod( "*" );
      oldgeo = "";
    }
    
  } //* End while keyword
  
  deleteTriggers();
  
  setTrigger( "enrichLocations", 1 );
  
}


//**************************************************************************************
// Method: execPass2()
//
// --> Starts scraping the site 'EnrichSite' for enriching the data
//**************************************************************************************
Scraper.prototype.execPass2 = function() {
  Logger.log( 'Starting Scraper (Pass 2) : ' + this.name );
  
  deleteTriggers();
  
  //* Get the settings and create sitescraper
  this.settings = new Settings( this.db_cnf.sheet ); 
  this.scrape   = new Sitescraper();
  
  //* Perform the correct init function related to scrapesite
  switch( this.settings.search['enrichsite'].toLowerCase() ) {
      
    case 'booking' :
      initBooking( this.scrape );
      var col      = this.settings.variables['booking:checkcol'].toLowerCase();
      var batchmax = this.settings.variables['booking:batchmax'];
      //#Logger.log( 'Initialized Booking' );
      break;
      
    case 'telefoonboek' :
      initTelefoonboek( this.scrape );
      var col      = this.settings.variables['telefoonboek:checkcol'].toLowerCase();
      var batchmax = this.settings.variables['telefoonboek:batchmax'];
      Logger.log( 'Initialized Telefoonboek : col = ' + col + ' , batchmax = ' + batchmax );
      break;
      
    case 'bedrijvenpagina' :
      initBedrijvenpagina( this.scrape );
      var col      = this.settings.variables['bedrijvenpagina:checkcol'].toLowerCase();
      var batchmax = this.settings.variables['bedrijvenpagina:batchmax'];
      Logger.log( 'Initialized Bedrijvenpagina' );
      break;
      
    case 'zorgkaartnl' :
      initZorgkaartNL( this.scrape );
      var col      = this.settings.variables['zorgkaartnl:checkcol'].toLowerCase();
      var batchmax = this.settings.variables['zorgkaartnl:batchmax'];
      Logger.log( 'Initialized ZorgkaartNL' );
      break;
      
    case 'google' :
      initGoogle( this.scrape );
      var col      = this.settings.variables['google:checkcol'].toLowerCase();
      var batchmax = this.settings.variables['google:batchmax'];
      //#Logger.log( 'Initialized Google' );
      break;
      
    case 'google maps' :
      initGoogleMaps( this.scrape );
      var col      = this.settings.variables['googlemaps:checkcol'].toLowerCase();
      var batchmax = this.settings.variables['googlemaps:batchmax'];
      //#Logger.log( 'Initialized Google' );
      break;
      
    case 'email' :
      initEmail( this.scrape );
      var col      = this.settings.variables['email:checkcol'].toLowerCase();
      var batchmax = 9999999;
      //#Logger.log( 'Initialized Email scraper' );
      break;      
      
    default :
      break;      
  }  
  
  //* Find line to start
  var start = 0;
  var i     = 0;

  var fidx  = this.db.fieldindex[ col ];
  
  Logger.log( "#Records = " + this.db.nrrecords );
  
  while ( i < this.db.nrrecords ) {
    
    //#Logger.log( "i = " + i );
    var r = this.db.getRecordByIndex( i );  
    
    //#Logger.log( r.fieldvalue[ 8 ] + " : " + r.fieldvalue[fidx] );
    
    if ( r.fieldvalue[fidx] != null && r.fieldvalue[fidx] != '' ) {
      start = i + 1;
    }
    else {
      i = this.db.nrrecords;
      //#Logger.log('Edit with i = ' + i);
    }
    i = i + 1;
    //#Logger.log('i = i + 1');
  }
  
  if ( start > this.db.nrrecords ) {
    Logger.log( "Not started: reached end of list - " + start );
    return;
  }
  
  setTrigger( "enrichLocations", 35 );
  setTrigger( "enrichLocations", 1440 );
  
  var lineschecked = 0;
  
  Logger.log(" Starting at line: " + start );
  
  for ( i = start; i < this.db.nrrecords && lineschecked < batchmax ; i++) {
    
    r = this.db.getRecordByIndex( i );
    
    if ( r.fieldvalue[fidx] != null && r.fieldvalue[fidx] != '' ) {
      i = i + 30;
    }
    
    var field = i + 1;
    
    if ( field >= this.db.nrrecords + 1 ) {
      
      i = 0;
      var found = 0;
      while ( i < this.db.nrrecords && !found) {
        
        r = this.db.getRecordByIndex( i );
        
        if ( r.fieldvalue[fidx] != null && r.fieldvalue[fidx] != '' ) {
          i = i + 1;
        }
        else {
          found = 1;
        }
        field = i + 1;
      }
      
      if ( field >= this.db.nrrecords ) {
        SpreadsheetApp.flush();
        return;
      }
    }
  
    lineschecked++;
    this.scrape.fn_execpass2( this, r );
  }
  
  //#deleteTriggers();
}