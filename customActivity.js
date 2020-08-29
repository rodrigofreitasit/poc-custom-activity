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

connection.on("requestedSchema", function (data) {
  // save schema
  for (var i = 0; i < data.schema.length; i++) {
    console.log(data.schema[i].key);
  }
  console.log("*** Schema ***", JSON.stringify(data["schema"]));
});
