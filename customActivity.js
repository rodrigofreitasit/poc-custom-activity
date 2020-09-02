"use strict";

var connection = new Postmonger.Session();
var payload = {};
var schema = {};

$(window).ready(onRender);

connection.on("initActivity", initialize);
connection.on("clickedNext", save);

function onRender() {
  // JB will respond the first time 'ready' is called with 'initActivity'
  connection.trigger("ready");

  connection.trigger("requestTokens");
  connection.trigger("requestEndpoints");

  // request schema
  connection.trigger("requestSchema");
}

// Broadcast in response to a requestSchema event called by the custom application.
connection.on("requestedSchema", function (data) {
  if (data.error) {
    console.error(data.error);
  } else {
    schema = data["schema"];
  }
  console.log("Schema: ", JSON.stringify(schema));
});

function initialize(data) {
  console.log("initialize: ", data);
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
//     "key": "Event.DEAudience-cbf6ce98-ba4f-a5c1-cc68-503ca1f60c39.Id",
//     "type": "Text",
//     "length": 18,
//     "default": null,
//     "isNullable": null,
//     "isPrimaryKey": null
// }, {
//     "key": "Event.DEAudience-cbf6ce98-ba4f-a5c1-cc68-503ca1f60c39.Name",
//     "type": "Text",
//     "length": 50,
//     "default": null,
//     "isNullable": null,
//     "isPrimaryKey": null
// }, {
//     "key": "Event.DEAudience-cbf6ce98-ba4f-a5c1-cc68-503ca1f60c39.Mobile",
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
      if (field.key.indexOf("DEAudience") !== -1)
        formArg[name] = "{{" + field.key + "}}";
    }
  }
  return formArg;
}

function save() {
  var postcardURLValue = $("#inputTitle").val();
  var postcardTextValue = $("#ctaText").val();
  var fields = extractFields();

  payload["arguments"].execute.inArguments = [
    {
      emailAddress: "{{Contact.Attribute.PostcardJourney.EmailAddress}}",
      fields: fields,
    },
  ];

  payload["metaData"].isConfigured = true;

  console.log(payload);
  connection.trigger("updateActivity", payload);
}
