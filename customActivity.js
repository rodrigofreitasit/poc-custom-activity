var connection = new Postmonger.Session();


connection.trigger('ready');

connection.on('initActivity', function(data){
    document.getElementById('configuration').value= JSON.stringfy(data,null,2);

});

//save

connection.on('clickedNext',function(){
    var configuration=JSON.parse(document.getElementById('configuration').value);
    connection.trigger('updateActivity',configuration);
})