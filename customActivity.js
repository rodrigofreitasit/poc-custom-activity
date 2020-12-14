'use strict';

var connection = new Postmonger.Session();
var payload = {};
var schema = {};

$(window).ready(onRender);
connection.on('initActivity', initActivity);
connection.on('clickedNext', save);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedEndpoints', onGetEndpoints);

function onRender() {
	// JB will respond the first time 'ready' is called with 'initActivity'
	connection.trigger('ready');
	connection.trigger('requestTokens');
	connection.trigger('requestEndpoints');
	// requisição dos campos da DE
	connection.trigger('requestSchema');
	connection.trigger('nextStep');
	connection.trigger('prevStep');
	connection.trigger('requestInteractionDefaults');
	connection.trigger('requestInteraction');
	connection.trigger('requestTriggerEventDefinition');
}

// connection.on('initActivity', initActivity);
function initActivity(payload) {
	console.log('initActivity: ', payload);
}

connection.on('requestedTokens', requestedTokens);
function requestedTokens(tokens) {
	console.log('requestedTokens: ', tokens);
}

// Broadcast in response to a requestSchema event called by the custom application.
connection.on('requestedSchema', requestedSchema);
function requestedSchema(data) {
	if (data.error) {
		console.error('requestedSchema Error: ', data.error);
	} else {
		schema = data['schema'];
	}
	console.log('requestedSchema: ', schema);
}

// function initialize(data) {
// 	console.log('initialize: ', data);
// 	if (data) {
// 		payload = data;
// 	}

// 	var hasInArguments = Boolean(
// 		payload['arguments'] &&
// 			payload['arguments'].execute &&
// 			payload['arguments'].execute.inArguments &&
// 			payload['arguments'].execute.inArguments.length > 0
// 	);

// 	var inArguments = hasInArguments
// 		? payload['arguments'].execute.inArguments
// 		: {};

// 	console.log('inArguments: ', inArguments);

// 	$.each(inArguments, function (index, inArgument) {
// 		$.each(inArgument, function (key, val) {});
// 	});

// 	connection.trigger('updateButton', {
// 		button: 'next',
// 		text: 'done',
// 		visible: true,
// 	});
// }

function extractFields() {
	var formArg = {};
	console.log('*** Schema parsing ***', JSON.stringify(schema));
	if (schema !== 'undefined' && schema.length > 0) {
		// the array is defined and has at least one element
		for (var i in schema) {
			var field = schema[i];
			var index = field.key.lastIndexOf('.');
			var name = field.key.substring(index + 1);
			if (field.key.indexOf('DEAudience') !== -1)
				formArg[name] = '{{' + field.key + '}}';
		}
	}
	return formArg;
}

function save() {
	var title = $('#inputTitle').val();
	var subtitle = $('#inputSubTitle').val();
	var msgbody = $('#inputMsg').val();
	var ctaLink = $('#inputCtaText').val();
	var fields = extractFields();

	payload['arguments'].execute.inArguments = [
		{
			ContactKey: '{{Contact.Key}}',
			title: title,
			subtitle: subtitle,
			msgbody: msgbody,
			ctaLink: ctaLink,
			variables: fields,
		},
	];

	payload['metaData'].isConfigured = true;

	console.log(payload);
	connection.trigger('updateActivity', payload);
}

// Max text area count
$('textarea').keyup(function () {
	var characterCount = $(this).val().length,
		current = $('#current'),
		maximum = $('#maximum'),
		theCount = $('#the-count');

	current.text(characterCount);
});
