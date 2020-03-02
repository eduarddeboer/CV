//**************************************************************************************
// Function: initEmail( s )
//
// --> Initialize Email Scraper
//
// Arguments:
// - s : Scrapersite object
//**************************************************************************************
function initEmail( s ) {
  s.setName( 'Email' );
  s.setCheckCol( 'Email' );
  s.setExec2( EmailExecPass2 );
  return( true );
}


function EmailExecPass2( s, r ) {
  var regExp_email  = /([a-zA-Z0-9._\-\+]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  var regExp_email2 = /mailto:(.*?)"/;
  //var regExp_domain = /^(?:\/\/|[^\/]+)*/;
  var regExp_domain = /(http[s]?:\/\/)(.*?)\/?$/g;
  var regExp_href   = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
  var email  = [];
  var html   = '';
  var domain = '';
  var prefix = '';
  var adr    = [];
  var href   = [];
  var urls   = [];
  var website= '';
  var found  = 0;
  
  //* Return immediately if there is no website known
  var website  = r.fieldvalue[ s.db.fieldindex[ 'website' ] ];
  var curmail  = r.fieldvalue[ s.db.fieldindex[ 'email' ] ]
 
  if ( website == '' ) {
    return;
  }
  
  try {
    var thisurl = regExp_domain.exec(website);
    prefix = thisurl[ 1 ];
    domain = thisurl[ 2 ];
  } catch ( err ) {
    Logger.log( err );
  } 
  
  //#Logger.log( "Webiste = " + website );
  //#Logger.log( 'Domain = ' + domain);
  
  // 1. Get http from website and add URL of website
  html = getHTMLPage( website ); 
  urls.push( website );
  
  // 2. Get all URLs on homepage
  if ( html != '' ) {
    try {
      //Logger.log( 'Checking homepage for URLs: ' + website );
      var url;
      var href = regExp_href.exec(html);
    
      //html = U2A( html );
      
      while (( url = regExp_href.exec( html ) ) != null ) {
        if ( urls.indexOf( url[1]) == -1 && (url[1][0] == '/' || url[1].indexOf( domain ) > -1 || url[1].indexOf( '..' ) > -1) &&
             url[1].indexOf( '.jpg') == -1 &&
             url[1].indexOf( '.pdf') == -1
        //if ( urls.indexOf( url[1]) == -1 
           ) {
             
             if ( url[1].indexOf( domain ) == -1 ) {
               url[1] = prefix + domain + '/' + url[1];
             }
             
             //Logger.log("   >> Adding " + url[1] );
             urls.push( url[1] );
        }
      }   
    } catch ( err ) {
      Logger.log( err );
    }  
    
    //Logger.log( urls );
  }
  
  
  // 3. Check for email address on all pages -- If present : register
  //#Logger.log( 'Start checking emails at ' + urls.length + ' URLs' );
  for ( var i = 1; i < urls.length ; i++ ) {
    html = getHTMLPage( urls[ i ] );
    
    //Logger.log("    >> Checking : " + urls[i] );
    //* Try normal email regex
    if ( html != '' ) {
      try {
        var adr  = regExp_email.exec(html);
        Logger.log( JSON.stringify(adr) );
    
        for ( var j = 1; adr != undefined && j < adr.length; j++ ) {
          if ( email.indexOf( adr[j] ) == -1 ) {  
            email.push( adr[j] );
            found++;
          }
        }    
      } catch ( err ) {
        Logger.log( err );
      }
    }
    
    //* Try mailto: email regex
    if ( html != '' ) {
      try {
        var adr  = regExp_email2.exec(html);
        Logger.log( JSON.stringify(adr) );
    
        for ( var j = 1; adr != undefined && j < adr.length; j++ ) {
          if ( email.indexOf( adr[j] ) == -1 ) {  
            email.push( adr[j] );
            found++;
          }
        }    
      } catch ( err ) {
        Logger.log( err );
      }
    }
    
    //#Logger.log( 'Checking : >' + urls[i] + '<' );
    //html = getHTMLPage( urls[ i ] ); 
  }
  
  if ( found == 0 ) {
    email.push('N/A'); 
  }
  
  r.setFieldValue( 'email', email, s.db.fieldindex );
  
  //* Update the record
  s.db.updateRecord( r.index );
  
  //#Logger.log( 'Email = >' + email + '<' );
}


function getLinks( html ) {
  
}