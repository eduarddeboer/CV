//**************************************************************************************
// Class: List()
//
// - Contains the following fields
//   - ssID    : Spreadsheet ID
//   - 
//**************************************************************************************
function List( id, tabname ) {
  
  this.sheet = new DB( id, tabname );
  
  
}