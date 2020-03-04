//**************************************************************************************
// Class: DB()
//
// --> For abstracting database usage
//
// Contains the following fields
//   - ss    : Spreadsheet object
//   - url   : URL of the spreadsheet
//
// Returns: 
//   - null in case of error opening either a spreadsheet by URL or by Id
//**************************************************************************************
function DB( id, sheetname ) {
  
  try {
    this.ss = SpreadsheetApp.openByUrl( id );
    this.url = id;
  } catch ( err ) {
    ;
  }
  
  try {
      this.ss = SpreadsheetApp.openById( id );
      this.url = this.ss.getUrl();
    } catch( err ) {
      Logger.log( 'ERROR opening database "' + id + '"' );
      return( null );
    }
  
  //#Logger.log( "Successfully opened : " + sheetname );
  
  this.sheet = this.ss.getSheetByName( sheetname );
  
  //#Logger.log( this.sheet );
  
  this.range       = {};
  this.values      = {};
  this.keyname     = '';
  this.fields      = {};
  this.fieldindex  = {};  
  this.records     = {};
  this.nrrecords   = 0;
  this.nrfields    = this.ss.getLastColumn();
  
}


//**************************************************************************************
// Method: getRecords( keyname )
//
// --> Returns an array of the records indexed on 'keyname'
//**************************************************************************************
DB.prototype.getRecords = function( keyname ) {
  //* If key doesn't exist, take 'locationurl' as default key
  if ( this.fields[keyname] == undefined ) {
    keyname = 'locationurl';
  }
  
  //#Logger.log( "In getRecords" );
  
  this.keyname = keyname.toLowerCase();
  
  //* Get the values
  this.getValues();
  
  //* Loop through all records
  var lastrow = this.sheet.getLastRow() - 1;
  
  //#Logger.log( "LastRow = " + lastrow );
  
  for ( var i = 0; i < lastrow; i++ ) {
    
    //* Get current record from table into line item
    var line = this.values[i];
    
    //#Logger.log( "Line[i] = " + line );
    
    //* Create record from line item
    var r = new Record( this.fields );
    
    //#Logger.log( "Line = " + line );
    
    var keyid = r.setFieldValues( line, this.fieldindex, this.keyname );
    r.index = i;
    this.records[ keyid ] = r;
    this.nrrecords++;
    
    //#Logger.log( "Record = " + JSON.stringify(r) );
  }
  
  //#Logger.log( "Leaving getRecords" );
  
  return( this.records ); 
}


//**************************************************************************************
// Method: getValues()
//
// --> Returns a two-dimensional array with all the values
//**************************************************************************************
DB.prototype.getValues = function() {
  
  this.range  = this.sheet.getRange( 2, 1, this.sheet.getLastRow(), this.sheet.getLastColumn() );
  this.values = this.range.getValues();
  
  return( this.values ); 
}


//**************************************************************************************
// Method: getFields()
//
// --> Returns a one-dimensional array with all the field headers
//**************************************************************************************
DB.prototype.getFields = function() {
  
  //#Logger.log( "Entering getFields" );
  
  //* Use stored field names, if available
  //if ( this.fields != undefined ) {
  //  return( this.fields );
  //}
  
  //* Otherwise, get the field names from the 1st row of the spreadsheet
  this.range  = this.sheet.getRange( 1, 1, 1, this.sheet.getLastColumn() );  
  this.fields = this.range.getValues()[0];
  
  //* Then set field indexes correct
  for ( var i = 0; i < this.fields.length; i++ ) {
    if ( this.fields[i] != '' ) {
      this.fieldindex[ this.fields[i].toLowerCase() ] = i; 
    }
  }
  
  this.nrfields = i;
  
  return( this.fields ); 
}


//**************************************************************************************
// Method: reIndexByKey( keyname )
//
// --> Reindexes the existing array on the specified keyname to be used by
//     getRecordByIndex( index )
//**************************************************************************************
DB.prototype.reindexByKey = function( keyname ) {
  
  //* Return null if key doesn't exist
  if ( this.fields[keyname] == undefined ) {
    return( null );
  }
  
  this.key = keyname;
  
  return( true ); 
}


//**************************************************************************************
// Method: getRecordByIndex( index )
//
// --> Returns the record at the position 'index' within the array (~ line number)
//**************************************************************************************
DB.prototype.getRecordByIndex = function( index ) {
  var line = this.values[ index ];
  
  var r = this.records[ line[ this.fieldindex[ this.keyname ] ] ];
  
  //#Logger.log( "Returning : " + r );
  
  return( r ); 
}


//**************************************************************************************
// Method: getRecordByKey( keyvalue )
//
// --> Returns the record with the specified 'keyvalue' as key
//**************************************************************************************
DB.prototype.getRecordByKey = function( keyvalue ) {
  var r = this.records[ keyvalue ];
  
  return( r ); 
}


//**************************************************************************************
// Method: updateRecord()
//
// --> Copies the values of the record back in the array
//**************************************************************************************
DB.prototype.updateRecord = function( index ) {
  var line  = this.values[ index ];
  var lines = [];
  
  //#Logger.log( "  In UpdateRecord, line = >" + line + "<" );
  
  var r = this.records[ line[ this.fieldindex[ this.keyname ] ] ];
  
  var now =  Utilities.formatDate(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd HH:mm');
  r.setFieldValue( 'lastdate', now, this.fieldindex );
  
  //#Logger.log( "Fieldindex = " + this.fieldindex[ 'creationdate' ] );
  //#Logger.log( "       Original crea = " + r.fieldvalue[ this.fieldindex[ 'creationdate' ] ] );
  
  var crea = Utilities.formatDate( new Date( r.fieldvalue[ this.fieldindex[ 'creationdate' ] ]) , 'Europe/Amsterdam', 'yyyy-MM-dd HH:mm');
  r.setFieldValue( 'creationdate', crea, this.fieldindex );
  
  //#Logger.log( "   >>> Creation date = " + crea );
  
  for (var i = 0; i < r.nrfields; i++ ) {
    //#Logger.log( i + " : " + r.fieldvalue[ i ] + "\n" );
    //#Logger.log( i + " : " + r.fieldvalue[ this.fields[ i ].toLowerCase()  ] + "\n" );
    line[ i ] = r.fieldvalue[ i ].toString();
  }
  
  lines.push( line );
  
  //#Logger.log( "  In UpdateRecord, line = >" + lines + "<" );
  //#var linerange = this.data.getRange( index+2, 1, 1, this.data.getLastColumn() ).getValues( );
  //#Logger.log( linerange );
  
  
  this.sheet.getRange( index+2, 1, 1, this.nrfields ).setValues( lines );
  this.flush();
  
  return( true ); 
}


//**************************************************************************************
// Method: appendRecord()
//
// --> Appends a record to the DB and the in-memory table
//**************************************************************************************
DB.prototype.appendRecord = function( record ) {
  var line  = [];
  
  //* Set LastDate to now()
  var now =  Utilities.formatDate(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd HH:mm').toString();
  record.setFieldValue( 'LastDate', now, this.fieldindex );
  record.setFieldValue( 'CreationDate', now, this.fieldindex );
  
  //#Logger.log( "Record = " + record );
  
  //* Add this record also to the current array of records
  this.records[ line[ this.fieldindex[ this.keyname ] ] ] = record;
               
  for (var i = 0; i < record.nrfields; i++ ) {
    line[ i ] = record.fieldvalue[ i ];
  }
  
  //#Logger.log( "  In appendRecord, line = >" + line + "<" );
  
  this.sheet.appendRow( line );
  this.flush();
  
  return( true ); 
}



//**************************************************************************************
// Method: deleteByKeyword()
//
// --> Ask for a keyword and delete the whole corresponding record(s) where it occurs
//**************************************************************************************
DB.prototype.deleteByKeyword = function( keyword ) {  
  var ui = SpreadsheetApp.getUi();

  var result = ui.prompt(
      'Enter the keyword to delete',
      ui.ButtonSet.OK_CANCEL);

  var button = result.getSelectedButton();
  var text = result.getResponseText();
  
  if (button == ui.Button.CANCEL) {
    //* User clicked "Cancel".
    return;
  }
  
  //var rowsDeleted = 0;
  //for (var i = 1; i <= numRows - 1; i++) {
  //  var row = values[i];
  //  var url = row[0];
  //  
  //  if ( url.toLowerCase().indexOf( text ) > -1 )
  //  {
  //    Logger.log( "Deleted: " + url );
  //    sheet.deleteRow((parseInt(i)+1) - rowsDeleted);
  //    rowsDeleted++;
  //  }
  //}
  
  //Logger.log(' #Lines deleted: ' + rowsDeleted );
}


//**************************************************************************************
// Method: flush()
//
// --> Flushes changes to the database (~ updates spreadsheet)
//**************************************************************************************
DB.prototype.flush = function() {
  SpreadsheetApp.flush();
  return( true );
}