//**************************************************************************************
// Class: Mailer()
//
// --> For creating mailings
//
// Contains the following fields
//   - name      : Name of the mailer
//   - dailymax  : Max. # of messages per day
//   - batchmax  : Max. # of messages per batch
//   - senttoday : # of messages sent today
//
// Returns: 
//   - 
//**************************************************************************************
function Mailer( name ) { 
  this.name      = name;
  this.dailymax  = 0;
  this.batchmax  = 0;
  this.senttoday = 0;
}


function Mailing( name ) {
  
}


function Message( from, to, subject, body ) {
  this.from    = '';
  this.to      = '';
  this.subject = '';
  this.body    = '';
  
  
}


Message.prototype.setFrom = function( from ) {
  this.from = from;
}


Message.prototype.setTo = function( to ) {
  this.to = to;
}


Message.prototype.setSubject = function( subject ) {
  this.subject = subject;
}


Message.prototype.setBody = function( body ) {
  this.body = body;
}


Message.prototype.send = function( ) {
  
}


/**
 * Function for spinning text using spintax.
 * 
 * @param { text } spintax string
 * @return { string: spun text } 
*/
function preg_quote_(str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

function spin(s)
{
    var m = s.match(/\{(.*?)\}/i);
    if ( !m ) return s;

    var t = m[1];

    if ( t.indexOf("{") !== false )
    {
        t = t.substr(t.lastIndexOf("{") + 1);
    }

    var parts = t.split("|");

    var regex = new RegExp("\{" + preg_quote_(t) + "\}");
    s = s.replace( regex, parts[Math.floor(Math.random() * parts.length)] );

    return spin(s);
}