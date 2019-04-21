let request = require('request');
var fs = require('fs');
const subscriptionKey = 'f5fce6c694ea4d5fb288cd6aa27f4234';

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase =
    'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/analyze';

const imageUrl =
    'http://a0.att.hudong.com/34/31/01300000184280121967317984904.jpg';

// Request parameters.
const params = {
    'visualFeatures': 'Categories,Description,Color',
    'details': '',
    'language': 'en'
};

const options = {
    uri: uriBase,
    qs: params,
    //body: '{"url": ' + '"' + imageUrl + '"}',
    method: 'POST',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    },
    body: fs.readFileSync('./church.jpg')
};



async function asyncRequest(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => resolve({ error, response, body }));
  });
}

async function google() {
  let response = await asyncRequest(options);
  //console.log(response.response.statusCode);
  //console.log(response.response.body);
  let jsonResponse = JSON.stringify(JSON.parse(response.response.body), null, '  ');
  console.log('JSON Response\n');
  console.log(jsonResponse);

}

google();

