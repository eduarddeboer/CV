//**************************************************************************************
// Function: getHTMLPage( url )
//
// --> Fetches the specific URL and returns the HTML code
//**************************************************************************************
function getHTMLPage( url ) {
  var html = '';
  
  try {
    var response = UrlFetchApp.fetch(url);
    //#Logger.log("Scanning : " + url + " (Response code: " + response.getResponseCode() + ")" );
      
    if(response.getResponseCode() === 200) {
      html = response.getContentText();
    }
  } catch( err ) {
    Logger.log( '    getHTMLPage() : Caught error: ' + err );
    return( null );
  }
  
  return( html );
}


function getHTMLRequest( url ) {
  var html = '';
  
  try {
    var response = UrlFetchApp.getRequest(url);
    for(i in response) {
      Logger.log(i + ": " + JSON.stringify(response[i]));
    }
  } catch( err ) {
    Logger.log( '    getHTMLPage() : Caught error: ' + err );
    return( null );
  }
  
  return( html );
}