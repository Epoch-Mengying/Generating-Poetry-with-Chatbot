let request = require('request');
var fs = require('fs');
const subscriptionKey = 'f5fce6c694ea4d5fb288cd6aa27f4234';
const uriBase =
    'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/analyze';

const imageUrl =
    'http://a0.att.hudong.com/34/31/01300000184280121967317984904.jpg';

// Request parameters.
const params = {
    'visualFeatures': 'Categories',
    'details': '',
    'language': 'en'
};

const options = {
    uri: uriBase,
    qs: params,
    //body: '{"url": ' + '"' + imageUrl + '"}',
    //method: 'POST',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    },
    body: fs.readFileSync('./church.jpg')
};


// var options = {
//   url: 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/analyze',
//   qs: {
//     visualFeatures: 'Categories', 
//     details: '', 
//     language: 'en'
//   },
//   headers: {
//     'Content-Type': 'application/octet-stream',
//     'Ocp-Apim-Subscription-Key': 'f5fce6c694ea4d5fb288cd6aa27f4234'
//   },
//   body: fs.readFileSync('./church.jpg')
// };

request.post(options, function (error, response, body) {
    console.log(body);
});