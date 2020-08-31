"use strict";
//Variables
var last_selected_position_start = 0;
var last_selected_position_end = 0;
var last_selected_element = "";
var connection = new Postmonger.Session();
var eventDefinitionKey = "";
var fullEventDefinitionKey = "";
var config = "";
var currentStep = "";
var notificationConfig = "";

//Elements' array that composes the component (DOM Element, configuration JSON Object)
//ElementName = variable or DOM element name
//configLocation = logical address
//elementType = element's type that defines comportment for it
//step = step that manages the element
var elements = [
  {
    elementName: "notificationConfig",
    configLocation: "config.configurationArguments.publish.body",
    elementType: "JSON Object",
    step: "step1",
  },
  {
    elementName: "#inputActivityName",
    configLocation: "config.name",
    elementType: "DOM Element",
    step: "step1",
  },
  {
    elementName: "#inputCallToActionText",
    configLocation: "notificationConfig.ctaText",
    elementType: "DOM Element",
    step: "step1",
  },
  {
    elementName: "#inputImageHigh",
    configLocation: "notificationConfig.images[0].url",
    elementType: "DOM Element",
    step: "step1",
  },
  {
    elementName: "#inputImageMedium",
    configLocation: "notificationConfig.images[1].url",
    elementType: "DOM Element",
    step: "step1",
  },
  {
    elementName: "#inputImageLow",
    configLocation: "notificationConfig.images[2].url",
    elementType: "DOM Element",
    step: "step1",
  },
  {
    elementName: "#inputTitle",
    configLocation: "config.arguments.execute.inArguments[0].title",
    elementType: "DOM Element",
    step: "step2",
  },
  {
    elementName: "#txtBodyMsg",
    configLocation: "config.arguments.execute.inArguments[0].message",
    elementType: "DOM Element",
    step: "step2",
  },
  {
    elementName: "#inputActionLink",
    configLocation: "config.arguments.execute.inArguments[0].actionLink",
    elementType: "DOM Element",
    step: "step2",
  },
];

//Steps available for the component
var steps = [
  {
    step: "step1",
    visibleSectionId: "#step1",
  },
  {
    step: "step2",
    visibleSectionId: "#step2",
  },
];

$(document).ready(function () {
  //Trigger event for ready page (initActivity)
  connection.trigger("ready");

  //Trigger event for requested interaction
  connection.trigger("requestInteraction");

  //Trigger event for requested schema
  connection.trigger("requestSchema");

  //Trigger that is performed when component is opened
  connection.on("initActivity", function (data) {
    try {
      if (data) {
        //Populate variable with configuration data to be used locally
        config = data;

        //Get all element of each selected category
        var jsonObjectArray = getElementsArrayByType(
          [...elements],
          "JSON Object"
        );
        var domElementArray = getElementsArrayByType(
          [...elements],
          "DOM Element"
        );

        //Populate internal variables dynamically with pre-saved component's data
        jsonObjectArray.forEach(function (item, index) {
          var jsonObject = JSON.parse(eval(item.configLocation));
          eval(item.elementName + " = " + JSON.stringify(jsonObject));
        });

        //Populate DOM Objects dynamically with pre-saved component's data
        domElementArray.forEach(function (item, index) {
          $(item.elementName).val(eval(item.configLocation));
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  //Trigger that is performed when component is opened
  //Used for retrieving interaction's data
  connection.on("requestedInteraction", function (data) {
    try {
      //Iterare through array
      for (var i = 0; i < data.triggers.length; i++) {
        if (data.triggers[i].key == "TRIGGER") {
          //Vertify if there is a definition key
          if (data.triggers[i].metaData.eventDefinitionKey.length > 0) {
            //Definition Key
            eventDefinitionKey = data.triggers[i].metaData.eventDefinitionKey;
            //Definition Key displayed at front-end
            fullEventDefinitionKey =
              "Event." + data.triggers[i].metaData.eventDefinitionKey;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  //Trigger that is performed when component is opened
  //Used for retrieving interaction's data
  connection.on("requestedSchema", function (data) {
    try {
      //Clear unordered list DOM
      $("#variablesList").empty();

      //Split os schema object
      for (var i = 0; i < data.schema.length; i++) {
        //Default list item text
        var new_list_item =
          '<li id="{{id}}" class="list-group-item" value="{{value}}" onclick="varListItemClicked(this)">{{text}}</li>';

        //Generate id, value and name to be used into list item
        var li_id = data.schema[i].key;
        var li_value = "{{" + data.schema[i].key + "}}";
        var li_name = data.schema[i].key.replace(
          fullEventDefinitionKey + ".",
          ""
        );

        //Replace list item's keys with their values
        new_list_item = new_list_item.replace("{{id}}", li_id);
        new_list_item = new_list_item.replace("{{value}}", li_value);
        new_list_item = new_list_item.replace("{{text}}", li_name);

        //Append list item within unordered list DOM
        $("#variablesList").append(new_list_item);
      }
    } catch (e) {
      console.error(e);
    }
  });

  //Trigger that is performed when user clicks on "next" buttom
  connection.on("clickedNext", function () {
    try {
      //Get all element of each selected category
      var domElementArray = getElementsArrayByType(
        [...elements],
        "DOM Element"
      );
      var jsonObjectArray = getElementsArrayByType(
        [...elements],
        "JSON Object"
      );

      //Save DOM element's values into configured variable by logical address
      domElementArray.forEach(function (item, index) {
        if (item.step == currentStep) {
          if ($(item.elementName).val().length > 0) {
            eval(
              item.configLocation +
                " = " +
                JSON.stringify($(item.elementName).val())
            );
          } else {
            eval(item.configLocation + " = null");
          }
        }
      });

      //Save values into configuration variable by logical address
      jsonObjectArray.forEach(function (item, index) {
        if (item.step == currentStep) {
          var jsonString = JSON.stringify(eval(item.elementName));
          eval(item.configLocation + " = '" + jsonString + "'");
        }
      });

      //Perform "go to next step" event
      connection.trigger("nextStep");
    } catch (e) {
      console.error(e);
    }
  });

  //Create trigger for each text box (by its id)
  $.each(elements, function (key, value) {
    //Event triggered when cursor focuses out some text boxes
    $(value.elementName).on("focusout", function (event) {
      //Get text box that has focused out
      last_selected_element = "#" + event.target.id;
      //Get position where cursor was before focus out (where variable needs to be placed)
      last_selected_position_start = event.currentTarget.selectionStart;
      last_selected_position_end = event.currentTarget.selectionEnd;
    });
  });

  //Trigger that is performed when user clicks on "back" buttom
  connection.on("clickedBack", function () {
    //Perform "go to previous step" event
    connection.trigger("prevStep");
  });

  //Trigger that is performed when user goes to some step
  connection.on("gotoStep", function (step) {
    //Verify if requested step is different than previous step set into variable
    //If it is different, adjust interface
    //If it is not different, save configured value and close the interface
    if (currentStep != step.key) {
      //Change current step variable
      currentStep = step.key;

      //Adjust which step's section the interface must to show/hide
      steps.forEach(function (item, index) {
        if (item.step == currentStep) {
          $(item.visibleSectionId).show();
        } else {
          $(item.visibleSectionId).hide();
        }
      });
    } else {
      try {
        //Set value for isConfigured parameter into config object to TRUE
        config.metaData.isConfigured = true;

        //Update config object within Salesforce backend
        connection.trigger("updateActivity", config);
      } catch (e) {
        console.error(e);
      }
    }
  });

  //Event triggered when some li click is performed
  $("#variablesList li").on("click", function (event) {
    //Get the current text box value
    var old_text = $(last_selected_element).val();
    //Get ther text to be placed into text
    insert_value = $(this).attr("value");
    //Split text on cursor position
    left_text = old_text.substr(0, last_selected_position_start);
    right_text = old_text.substr(
      last_selected_position_end,
      old_text.length - last_selected_position_end
    );
    //Construct the new text (with new text placed)
    var new_text = left_text + insert_value + right_text;
    //Put the new text into text box
    $(last_selected_element).val(new_text);
    //Retrieve text box focus
    $(last_selected_element).focus();
    //Put selection cursor over the new position into text box (previous position + new text's length)
    $(last_selected_element).get(0).selectionEnd =
      last_selected_position_start + insert_value.length;
  });
});

//Event triggered when some li click is performed
function varListItemClicked(data) {
  //Get the current text box value
  var old_text = $(last_selected_element).val();
  //Get ther text to be placed into text
  var insert_value = data.getAttribute("value");
  //Split text on cursor position
  var left_text = old_text.substr(0, last_selected_position_start);
  var right_text = old_text.substr(
    last_selected_position_end,
    old_text.length - last_selected_position_end
  );
  //Construct the new text (with new text placed)
  var new_text = left_text + insert_value + right_text;
  //Put the new text into text box
  $(last_selected_element).val(new_text);
  //Retrieve text box focus
  $(last_selected_element).focus();
  //Put selection cursor over the new position into text box (previous position + new text's length)
  $(last_selected_element).get(0).selectionEnd =
    last_selected_position_start + insert_value.length;
}

//Treat elements' types
function getElementsArrayByType(elementsArray, elementType) {
  var newElementsArray = [];

  while (elementsArray.length > 0) {
    //Extract elementsArray item
    var item = elementsArray.shift();

    //Verify if extracted item type is the same as requested
    if (item.elementType == elementType) {
      //Include the verified item into a new array
      newElementsArray.push(item);
    }
  }

  //Return the new array
  return newElementsArray;
}
