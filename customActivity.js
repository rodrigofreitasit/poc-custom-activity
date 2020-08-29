var connection = new Postmonger.Session();

connection.trigger("ready");
connection.trigger("requestSchema");

connection.on("initActivity", function (data) {
  document.getElementById("configuration").value = JSON.stringify(
    data,
    null,
    2
  );
});

//save
connection.on("clickedNext", function () {
  var configuration = JSON.parse(
    document.getElementById("configuration").value
  );
  connection.trigger("updateActivity", configuration);
});

//requestSchema
connection.on("requestedSchema", function (data) {
  // save schema
  var deValues = JSON.stringify(data["schema"]);
  for (var i = 0; i < deValues.length; i++) {
    console.log(deValues[i].key);
  }
});
