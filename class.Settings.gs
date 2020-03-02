//**************************************************************************************
// Class: Settings()
//
// --> For abstracting settings usage
//
// Contains the following fields
//   - search{}
//   - variables{}
//   - status{}
//   - keywords[]
//   - geomods[]
//   
//
// Returns: 
//   - null in case of error opening either a spreadsheet
//**************************************************************************************
function Settings( sheet ) {
  this.sheet      = sheet;
  
  this.search     = {};
  this.variables  = {};
  this.status     = {};
  this.keywords   = [];  
  this.geomods    = [];
  this.stars      = [];
  this.types      = [];
  
  this.getSearch();
  this.getVariables();
  this.getStatus();
  this.getKeywords();
  this.getGeomods();
  this.getStars();
  this.getTypes();
}

//**************************************************************************************
// Method: getSearch(  )
//
// --> Reads the Search parameters
//**************************************************************************************
Settings.prototype.getSearch = function() {
  
  //Logger.log( this.sheet );
  
  var range  = this.sheet.getRange( 3, 1, 15, 2 );
  var values = range.getValues();
  
  this.convertToArray( this.search, values );
  
  return( true );
}


//**************************************************************************************
// Method: saveSearch(  )
//
// --> Save the Search settings (for looping)
//**************************************************************************************
Settings.prototype.saveSearch = function() {
  
  var values = new Array( 15 );  
  var range  = this.sheet.getRange( 3, 1, 15, 2 );
  
  var i = 0;
  for ( var key in this.search ) {
    //#Logger.log( "Key = " + key );
    values[i] =new Array( 2 );
    values[i][0] = key;
    values[i][1] = this.search[ key ];
    i++;
  }
  
  while ( i < 15 ) {
    values[i] =new Array( 2 );
    values[i][0] = '';
    values[i++][1] = '';
  }
  
  //#Logger.log( values );
  range.setValues( values );
  
  SpreadsheetApp.flush();
  
  return( true );
}
  

//**************************************************************************************
// Method: getVariables(  )
//
// --> Reads the variables for the scraper
//**************************************************************************************
Settings.prototype.getVariables = function() {
  var range  = this.sheet.getRange( 21, 1, 20, 2 );
  var values = range.getValues();
  
  this.convertToArray( this.variables, values );
  
  return( true );
}


//**************************************************************************************
// Method: getStatus(  )
//
// --> Reads the statuses and actions for manipulating the data
//**************************************************************************************
Settings.prototype.getStatus = function() {
  var range  = this.sheet.getRange( 3, 4, 35, 2 );
  var values = range.getValues();
  
  this.convertToArray( this.status, values );
  
  return( true );
}


//**************************************************************************************
// Method: getKeywords(  )
//
// --> Reads the different keywords (only if search['keyword'] == '*'
//**************************************************************************************
Settings.prototype.getKeywords = function() {
  var range  = this.sheet.getRange( 3, 7, 500, 1 );
  var values = range.getValues();
  
  this.copyToArray( this.keywords, values );
  
  return( true );
}



//**************************************************************************************
// Method: getGeomods(  )
//
// --> Reads the different geomods (only if search['geomod'] == '*'
//**************************************************************************************
Settings.prototype.getGeomods = function() {
  var range  = this.sheet.getRange( 3, 8, 500, 1 );
  var values = range.getValues();
  
  this.copyToArray( this.geomods, values );
  
  return( true );
}



//**************************************************************************************
// Method: getStars(  )
//
// --> Reads the different geomods (only if search['stars'] == '*'
//**************************************************************************************
Settings.prototype.getStars = function() {
  var range  = this.sheet.getRange( 3, 9, 35, 1 );
  var values = range.getValues();
  
  this.copyToArray( this.stars, values );
  
  return( true );
}


//**************************************************************************************
// Method: getTypes(  )
//
// --> Reads the different geomods (only if search['stars'] == '*'
//**************************************************************************************
Settings.prototype.getTypes = function() {
  var range  = this.sheet.getRange( 3, 10, 35, 1 );
  var values = range.getValues();
  
  this.copyToArray( this.types, values );
  
  return( true );
}


//**************************************************************************************
// Method: convertToArray(  )
//
// --> Converts the 2-dimensional value array to an array of KVPs
//**************************************************************************************
Settings.prototype.convertToArray = function( arr, values ) {
  
  for ( var i = 0; i < values.length; i++ ) {
    if ( values[i][0] != '' ) {
      arr[ values[i][0].toLowerCase() ] = values[i][1];
    }
  }
  
  return( true );
}


//**************************************************************************************
// Method: copyToArray(  )
//
// --> Converts the 2-dimensional value array to an array of KVPs
//**************************************************************************************
Settings.prototype.copyToArray = function( arr, values ) {
  
  var j = 0;
  
  for ( var i = 0; i < values.length; i++ ) {
    if ( values[ i ] != '' ) {
      arr[ j++ ] = values[ i ][0];
    }
  }
  
  return( true );
}


//**************************************************************************************
// Method: getNextKeyword(  )
//
// --> Get the next keyword from the array of keywords
//**************************************************************************************
Settings.prototype.getNextKeyword = function( keyword ) {
  var newkey = "";
    
  if ( keyword == "*" ) {
    this.search['keyword'] = this.keywords[0].toLowerCase();
    return( this.keywords[0].toLowerCase() );
  }
  
  // Loop until end and get next geomod if available
  var i = 0;
  while ( (i < this.keywords.length) && (this.keywords[i] != "") && ( this.keywords[i].toLowerCase() != keyword ) ) {
    //#Logger.log( "Checking keyword : " + this.keywords[i] );
    i++;
  }
  
  if ( (this.keywords[i] != undefined ) && (keyword == this.keywords[i ].toLowerCase() ) && (i < this.keywords.length - 1) ) {
    newkey = this.keywords[i+1].toLowerCase();
  }
  
  this.search['keyword'] = newkey;
  this.saveSearch();
  
  return( newkey );
}


//**************************************************************************************
// Method: getNextGeomod(  )
//
// --> Get the next gemod from the array of gemods
//**************************************************************************************
Settings.prototype.getNextGeomod = function( geomod ) {
  var newgeo = '';

  if ( geomod == '*') {
    this.search['geomodifier'] = this.geomods[0].toLowerCase();
    return( this.geomods[0].toLowerCase() );
  }
  
  // Loop until end and get next geomod if available
  var i = 0;
  while ( (i < this.geomods.length) && (this.geomods[i] != "") && ( this.geomods[i].toLowerCase() != geomod ) ) {
    //#Logger.log( "Checking keyword : " + this.geomods[i] );
    i++;
  }
  
  if ( (this.geomods[i] != undefined ) && (geomod == this.geomods[i].toLowerCase() ) && (i < this.geomods.length - 1) ) {
    newgeo = this.geomods[i+1].toString().toLowerCase();
  }
  
  this.search['geomodifier'] = newgeo;  
  this.saveSearch();
  
  return( newgeo );
}