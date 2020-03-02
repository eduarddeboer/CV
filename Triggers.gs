//**************************************************************************************
// Function: deleteTriggers
//
// --> Delete all existing triggers for this project
//**************************************************************************************
function deleteTriggers( ) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
     ScriptApp.deleteTrigger(triggers[i]);
  }
}


function setTrigger( fn, minutes ) {
  var waittime = minutes * 60 * 1000;
  ScriptApp.newTrigger( fn )
    .timeBased()
    .after( waittime )
    .create();
}


function sleep(seconds) {
  const date = Date.now();
  const delay = seconds * 1000;
  var currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < delay);
}