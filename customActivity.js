var connection = new Postmonger.Session();

connection.trigger("ready");
connection.trigger("requestSchema");

connection.on("initActivity", function (data) {
  //   document.getElementById("configuration").value = JSON.stringify(
  //     data,
  //     null,
  //     2
  //   );
});

//save
connection.on("clickedNext", function () {
  var configuration = JSON.parse(
    document.getElementById("configuration").value
  );
  connection.trigger("updateActivity", configuration);
});

connection.on("requestedSchema", function (data) {
  // For to create a LI with values from DE schema
  for (var i = 0; i < data.schema.length; i++) {
    var node = document.createElement("LI"); // Create a <li> node
    var textnode = document.createTextNode(
      data.schema[i].key.substring(textnode.lastIndexOf(".") + 1)
    ); // Create a text node
    // var li_name = key.substring(textnode.lastIndexOf(".") + 1);
    node.appendChild(textnode); // Append the text to <li>
    document.getElementById("myList").appendChild(node);

    console.log(data.schema[i].key);
  }
});
