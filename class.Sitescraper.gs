//**************************************************************************************
// Class: Sitescraper()
//
// --> For abstracting scraping a particular site
//
// Contains the following fields
//   - name
//   - baseURL
//   - nextPageRegEx
//   - composeURL
//   - nextPageURL
//
// Returns: 
//
//**************************************************************************************

function Sitescraper() { 
  this.name          = '';
  this.baseURL       = '';
  this.nextPageRegEx = /(.*)/g;
  this.fn_startURL   = this.composeURL;
  this.startURL      = '';
  this.checkCol      = 'locationurl';
  this.nextPageURL   = this.fn_nextPageURL;
  this.fn_execpass1  = this.exec;  
  this.fn_execpass2  = this.exec;
}




Sitescraper.prototype.exec = function() {
  
  return( true );
}
  
  
//**************************************************************************************
// Method: fn_composeURL()
//
// --> Dummy composeURL function, can be redirected by specific scrapesite
//**************************************************************************************
Sitescraper.prototype.composeURL = function() {
  return( true );
}


//**************************************************************************************
// Method: fn_nextPageURL()
//
// --> Dummy nextPageURL function, can be redirected by specific scrapesite
//**************************************************************************************
Sitescraper.prototype.fn_nextPageURL = function() {
  return( true );
}

Sitescraper.prototype.setName = function( name ) {
  this.name = name;
  return( true );
}


Sitescraper.prototype.setBaseURL = function( url ) {
  this.baseURL = url;
  return( true );
}


Sitescraper.prototype.setCheckCol = function( colname ) {
  this.checkCol = colname.toLowerCase();
  return( true );
}


Sitescraper.prototype.setnextPageRegEx = function( regex ) {
  this.nextPageRegEx = regex;
  return( true );
}


Sitescraper.prototype.setStartURL = function( fn ) {
  this.fn_startURL = fn;
  return( true );
}

Sitescraper.prototype.setExec1 = function ( exec ) {
  this.fn_execpass1 = exec;
  return( true );
}


Sitescraper.prototype.setExec2 = function ( exec ) {
  this.fn_execpass2 = exec;
  return( true );
}