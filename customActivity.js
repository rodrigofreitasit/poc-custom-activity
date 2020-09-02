"use strict";

var connection = new Postmonger.Session();
var authTokens = {};
var payload = {};
var schema = {};

$(window).ready(onRender);

connection.on("initActivity", initialize);
connection.on("requestedTokens", onGetTokens);
connection.on("requestedEndpoints", onGetEndpoints);

connection.on("clickedNext", save);

function onRender() {
  // JB will respond the first time 'ready' is called with 'initActivity'
  connection.trigger("ready");
  connection.trigger("requestTokens");
  connection.trigger("requestEndpoints");
  connection.trigger("requestSchema");
}

function initialize(data) {
  console.log(data);
  if (data) {
    payload = data;
  }

  var hasInArguments = Boolean(
    payload["arguments"] &&
      payload["arguments"].execute &&
      payload["arguments"].execute.inArguments &&
      payload["arguments"].execute.inArguments.length > 0
  );

  var inArguments = hasInArguments
    ? payload["arguments"].execute.inArguments
    : {};

  console.log("inArguments: ", inArguments);

  $.each(inArguments, function (index, inArgument) {
    $.each(inArgument, function (key, val) {});
  });

  connection.trigger("updateButton", {
    button: "next",
    text: "done",
    visible: true,
  });
}

// schema parsing
// [{
//     "key": "Event.APIEvent-cbf6ce98-ba4f-a5c1-cc68-503ca1f60c39.Id",
//     "type": "Text",
//     "length": 18,
//     "default": null,
//     "isNullable": null,
//     "isPrimaryKey": null
// }, {
//     "key": "Event.APIEvent-cbf6ce98-ba4f-a5c1-cc68-503ca1f60c39.Name",
//     "type": "Text",
//     "length": 50,
//     "default": null,
//     "isNullable": null,
//     "isPrimaryKey": null
// }, {
//     "key": "Event.APIEvent-cbf6ce98-ba4f-a5c1-cc68-503ca1f60c39.Mobile",
//     "type": "Text",
//     "length": 50,
//     "default": null,
//     "isNullable": null,
//     "isPrimaryKey": null
// }]
function extractFields() {
  var formArg = {};
  console.log("*** Schema parsing ***", JSON.stringify(schema));
  if (schema !== "undefined" && schema.length > 0) {
    // the array is defined and has at least one element
    for (var i in schema) {
      var field = schema[i];
      var index = field.key.lastIndexOf(".");
      var name = field.key.substring(index + 1);
      // save only event data source fields
      // {"key":"Event.APIEvent-ed211fdf-2260-8057-21b1-a1488f701f6a.offerId","type":"Text",
      // "length":50,"default":null,"isNullable":null,"isPrimaryKey":null}
      if (field.key.indexOf("APIEvent") !== -1)
        formArg[name] = "{{" + field.key + "}}";
    }
  }
  return formArg;
}

//request schema from DE
connection.on("requestedSchema", function (data) {
  // For to create a LI with values from DE schema
  for (var i = 0; i < data.schema.length; i++) {
    var node = document.createElement("LI"); // Create a <li> node
    var deKey = data.schema[i].key;
    var liName = deKey.substring(deKey.lastIndexOf(".") + 1);
    var textnode = document.createTextNode(liName); // Create a text node
    node.appendChild(textnode); // Append the text to <li>
    document.getElementById("listaVariaveis").appendChild(node);

    console.log(data.schema[i].key);
  }
});

function save() {
  var postcardURLValue = $("#postcard-url").val();
  var postcardTextValue = $("#postcard-text").val();
  var fields = extractFields();

  payload["arguments"].execute.inArguments = [
    {
      emailAddress: "{{Contact.Key}}",
      fields: deKey,
    },
  ];

  payload["metaData"].isConfigured = true;

  console.log("payload: ", payload);
  connection.trigger("updateActivity", payload);
}

connection.on("initActivity", function (data) {
  document.getElementById("configuration").value = JSON.stringify(
    data,
    null,
    2
  );
  console.log("initActivity", data);
});

//Request Interaction data

connection.on("requestedInteraction", function (data) {
  console.log("requestedInteraction", data);
});

//Update config.json
connection.on("clickedNext", function () {
  var configuration = JSON.parse(
    document.getElementById("configuration").value
  );
  connection.trigger("updateActivity", configuration);
});
