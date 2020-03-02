//**************************************************************************************
// Class: Record()
//
// --> For abstracting database records
//
// Contains the following fields
//   -    : 
//   -    : 
//
// Returns: 
//   - null in case of error opening either a spreadsheet by URL or by Id
//**************************************************************************************
function Record( fieldnames ) { 
  this.key        = null;
  this.index      = -1;
  this.nrfields   = -1;
  this.fieldname  = [];
  this.fieldvalue = [];
  
  //* Get the number of fields
  this.nrfields = fieldnames.length;
  
  //* Copy the field names and set the corresponding field values to null;  
  for ( var i = 0; i < this.nrfields; i++ ) {       
    this.fieldname[ i ]  = fieldnames[i].toLowerCase();
    this.fieldvalue[ i ] = '';
  }
}
               

//**************************************************************************************
// Method: setFieldValue( fieldname, value )
//
// --> Updates the field 'fieldname' with value 'value'
//**************************************************************************************
Record.prototype.setFieldValue = function( fieldname, value, fieldindex ) {
  this.fieldvalue[ fieldindex[ fieldname.toLowerCase() ] ] = value;
  return( true ); 
}


//**************************************************************************************
// Method: setFieldValues( line, fieldindex, keyname )
//
// --> 
//**************************************************************************************
Record.prototype.setFieldValues = function( line, fieldindex, keyname ) {
  for ( var key in fieldindex ) {
    this.fieldvalue[ fieldindex[ key ] ] = line[ fieldindex[ key ] ];
  }
  
  return( this.fieldvalue[ fieldindex[ keyname ] ] ); 
}
