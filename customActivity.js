'use strict';

var connection = new Postmonger.Session();
var payload = {};
var schema = {};

$(window).ready(onRender);
connection.on('initActivity', initActivity);
connection.on('clickedNext', save);
connection.on('requestedTokens', requestedTokens);
connection.on('requestedSchema', requestedSchema);
connection.on('requestedEndpoints', requestedEndpoints);
connection.on('requestedInteractionDefaults', requestedInteractionDefaults);
connection.on('requestedInteraction', requestedInteraction);
connection.on(
	'requestedTriggerEventDefinition',
	requestedTriggerEventDefinition
);

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

function initActivity(data) {
	console.log('initActivity: ', JSON.stringify(data));
	if (data) {
		payload = data;
	}

	var hasInArguments = Boolean(
		payload['arguments'] &&
			payload['arguments'].execute &&
			payload['arguments'].execute.inArguments &&
			payload['arguments'].execute.inArguments.length > 0
	);

	var inArguments = hasInArguments
		? payload['arguments'].execute.inArguments
		: {};

	console.log('Has In arguments: ' + JSON.stringify(inArguments));

	connection.trigger('updateButton', {
		button: 'next',
		text: 'done',
		visible: true,
	});
}

function requestedTokens(tokens) {
	console.log('requestedTokens: ', tokens);
}

// Broadcast in response to a requestSchema event called by the custom application.
function requestedSchema(data) {
	if (data.error) {
		console.error('requestedSchema Error: ', data.error);
	} else {
		schema = data['schema'];
	}
	console.log('requestedSchema: ', schema);
}

function requestedEndpoints(endpoints) {
	console.log('endpoints: ', endpoints);
}

function requestedInteractionDefaults(settings) {
	console.log('requestedInteractionDefaults: ', settings);
}

function requestedInteraction(interaction) {
	console.log('requestedInteraction: ', interaction);
}

function requestedTriggerEventDefinition(eventDefinitionModel) {
	console.log(
		'requestedTriggerEventDefinition: ',
		eventDefinitionModel.eventDefinitionKey
	);
}

// function extractFields() {
// 	var formArg = {};
// 	console.log('*** Schema parsing ***', JSON.stringify(schema));
// 	if (schema !== 'undefined' && schema.length > 0) {
// 		// the array is defined and has at least one element
// 		for (var i in schema) {
// 			var field = schema[i];
// 			var index = field.key.lastIndexOf('.');
// 			var name = field.key.substring(index + 1);
// 			if (field.key.indexOf('DEAudience') !== -1)
// 				formArg[name] = '{{' + field.key + '}}';
// 		}
// 	}
// 	return formArg;
// }

// Ao clicar em done é atualizado o Payload com a configuração do Objeto
function save() {
	// var title = $('#inputTitle').val();
	// var subtitle = $('#inputSubTitle').val();
	// var msgbody = $('#inputMsg').val();
	// var ctaLink = $('#inputCtaText').val();
	// var fields = extractFields();

	payload['arguments'].execute.inArguments = [
		{
			// ContactKey: '{{Contact.Key}}',
			// title: title,
			// subtitle: subtitle,
			// msgbody: msgbody,
			// ctaLink: ctaLink,
			body: 'Your appointment is coming up on Dec 16 at 4PM',
			from: 'whatsapp:+14155238886',
			to: 'whatsapp:+5511984505745',
		},
	];

	payload['metaData'].isConfigured = true;

	console.log('save payload: ', JSON.stringify(payload));
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
