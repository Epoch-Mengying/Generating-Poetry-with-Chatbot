// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { ActionTypes, ActivityTypes, CardFactory } = require('botbuilder');
const path = require('path');
const axios = require('axios');
const fs = require('fs'); // file system
const request = require('request');

// Microsoft Azure API
const subscriptionKey = '';
const uriBase =
    'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/analyze';
const params = {
    'visualFeatures': 'Categories,Description',
    'details': '',
    'language': 'zh'
};

/**
 * Main ChatBot class
 */
class AttachmentsBot {

    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {

            // if the user sent an attachment
            if (turnContext.activity.attachments && turnContext.activity.attachments.length > 0) {
                await this.imageInput(turnContext);
            // if user types 
            } else {
                await this.stringInput(turnContext);
            }

        // If the Activity is a ConversationUpdate, send a greeting message to the user.
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate &&
            turnContext.activity.recipient.id !== turnContext.activity.membersAdded[0].id) {
            await turnContext.sendActivity('Welcome to the Chinese poem Generator');
            await turnContext.sendActivity('You may generate the poem by uploading a image or typing some keywords');

        // Respond to all other Activity types.
        } else if (turnContext.activity.type !== ActivityTypes.ConversationUpdate) {
            await turnContext.sendActivity(`[${ turnContext.activity.type }]-type activity detected.`);
        }
    }

    /*
     *  function for dealing with image imput 
     */
    async imageInput(turnContext) {

        // Prepare Promises to download each attachment and then execute each Promise.
        const promises = turnContext.activity.attachments.map(this.downloadAttachmentAndWrite);
        const successfulSaves = await Promise.all(promises);


        async function replyForReceivedAttachments(localAttachmentData) {

            // function for making for making asynchronous request 
            async function asyncRequest(options) {
              return new Promise((resolve, reject) => {
                request(options, (error, response, body) => resolve({ error, response, body }));
              });
            }

            // function for making for making asynchronous request. (POST request)
            async function asyncRequestPost(options) {
              return new Promise((resolve, reject) => {
                request.post(options.url, {
                  json: options
                }, (error, response, body) => resolve({ error, response, body }));
              });
            }

            // If image uploaded and save, start sending request to Azure for object and scene recognition
            if (localAttachmentData) {
                var imageUrl = './'+localAttachmentData.fileName
                console.log()
                const options = {
                    uri: uriBase,
                    qs: params,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key' : subscriptionKey
                    },
                    body: fs.readFileSync( imageUrl )
                };

                let response = await asyncRequest(options);
                let azureObject = JSON.parse(response.response.body)
                let caption = "";
                let tags = azureObject.description.tags;
                if (azureObject.description.captions.length > 0) {
                    caption = azureObject.description.captions[0].text
                }

                //console.log(caption)
                //console.log(tags)

                /* after getting reponse from Azure, start sending request to poem generater API
                */
                let options_poem = {
                    "url":"http://localhost:5000/todo/api/v1.0/tasks",
                    "inputString":caption,
                    "inputTags":tags,
                    "queryType":"Image"
                  };
                let response_poem = await asyncRequestPost(options_poem);
                //let jsonResponse_poem = JSON.stringify(response_poem.response.body.task, null, '  ')
                var printPoem = response_poem.response.body.task.poem.join("\r\n")
                var printkeywords = response_poem.response.body.task.keywords.join("\r\n")
                

                await this.sendActivity(`Keywords: \n ${ printkeywords } ` )
                await this.sendActivity(`Poem: \n ${ printPoem } ` )
            } else {
                await this.sendActivity('Attachment was not successfully saved to disk.');
            }
        }

        // Prepare Promises to reply to the user with information about saved attachments.
        // The current TurnContext is bound so `replyForReceivedAttachments` can also send replies.
        const replyPromises = successfulSaves.map(replyForReceivedAttachments.bind(turnContext));
        await Promise.all(replyPromises);
    }

    /**
     * upload images to storage
     */
    async downloadAttachmentAndWrite(attachment) {
        // Retrieve the attachment via the attachment's contentUrl.
        const url = attachment.contentUrl;

        // Local file path for the bot to save the attachment.
        const localFileName = path.join(__dirname, attachment.name);

        try {
            // arraybuffer is necessary for images
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            // If user uploads JSON file, this prevents it from being written as "{"type":"Buffer","data":[123,13,10,32,32,34,108..."
            if (response.headers['content-type'] === 'application/json') {
                response.data = JSON.parse(response.data, (key, value) => {
                    return value && value.type === 'Buffer' ?
                      Buffer.from(value.data) :
                      value;
                    });
            }
            fs.writeFileSync(localFileName, response.data, (fsError) => {
                if (fsError) {
                    throw fsError;
                }
            });
        } catch (error) {
            console.error(error);
            return undefined;
        }
        // If no error was thrown while writing to disk, return the attachment's name
        // and localFilePath for the response back to the user.
        return {
            fileName: attachment.name,
            localPath: localFileName
        };
    }

    /*
     *  function for dealing with textual inputs
     */
    async stringInput(turnContext) {

        const reply = { type: ActivityTypes.Message };
         // function for making for making asynchronous request 
        async function asyncRequest(options) {
          return new Promise((resolve, reject) => {
            request(options, (error, response, body) => resolve({ error, response, body }));
          });
        }

        // function for making for making asynchronous request. (POST request)
        async function asyncRequestPost(options) {
          return new Promise((resolve, reject) => {
            request.post(options.url, {
              json: options
            }, (error, response, body) => resolve({ error, response, body }));
          });
        }

        // regex expression for checking if the textual input is a hyperlink
        var pattern = /^((http|https|ftp):\/\/)/;

        // if it is a hyperlink, send post request to Azure API
        if(pattern.test(turnContext.activity.text)) {
            //reply.text = `You insert link '${ turnContext.activity.text }'`
            reply.attachments = [this.getInternetAttachment(turnContext.activity.text)];
            var imageUrl =turnContext.activity.text;
            var options = {
                uri: uriBase,
                qs: params,
                body: '{"url": ' + '"' + imageUrl + '"}',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key' : subscriptionKey
                }
            };

            let response = await asyncRequest(options);
            let azureObject = JSON.parse(response.response.body)
            let caption = "";
            let tags = azureObject.description.tags;
            if (azureObject.description.captions.length > 0) {
                caption = azureObject.description.captions[0].text
            }

            //console.log(caption)
            //console.log(tags)

            /* Then send request to poem generater API
            */
            let options_poem = {
                "url":"http://localhost:5000/todo/api/v1.0/tasks",
                "inputString":caption,
                "inputTags":tags,
                "queryType":"Image"
              };
            let response_poem = await asyncRequestPost(options_poem);
            var printPoem = response_poem.response.body.task.poem.join("\r\n")
            var printkeywords = response_poem.response.body.task.keywords.join("\r\n")
            
            // show image
            await turnContext.sendActivity(reply);
            //await turnContext.sendActivity(`You insert link '${ jsonResponse }'` );
            await turnContext.sendActivity(`Keywords: \n ${ printkeywords } ` )
            await turnContext.sendActivity(`Poem: \n ${ printPoem } ` )


        }
        else {
            reply.text = `You insert keywords '${ turnContext.activity.text }'`
            let options_poem = {
                    "url":"http://localhost:5000/todo/api/v1.0/tasks",
                    "inputString":turnContext.activity.text,
                    "inputTags":[],
                    "queryType":"Image"
                  };
                let response_poem = await asyncRequestPost(options_poem);
                //let jsonResponse_poem = JSON.stringify(response_poem.response.body.task, null, '  ')
                var printPoem = response_poem.response.body.task.poem.join("\r\n")
                var printkeywords = response_poem.response.body.task.keywords.join("\r\n")
                

                await turnContext.sendActivity(`Keywords: \n ${ printkeywords } ` )
                await turnContext.sendActivity(`Poem: \n ${ printPoem } ` )
        }
    }

    /**
     * for card display
     * @param {Object} turnContext
     */
    async displayOptions(turnContext) {
        const reply = { type: ActivityTypes.Message };
        const buttons = [
            { type: ActionTypes.ImBack, title: '1. Inline Attachment', value: '1' },
            { type: ActionTypes.ImBack, title: '2. Internet Attachment', value: '2' },
            { type: ActionTypes.ImBack, title: '3. Uploaded Attachment', value: '3' }
        ];

        const card = CardFactory.heroCard('', undefined,
            buttons, { text: 'You can upload an image or select one of the following choices.' });

        reply.attachments = [card];

        await turnContext.sendActivity(reply);
    }

}


    /**
     * Returns an attachment to be sent to the user from a HTTPS URL.
     */
    getInternetAttachment(link) {
        // NOTE: The contentUrl must be HTTPS.
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: link
        };
    }


    /**
     * Returns an attachment that has been uploaded to the channel's blob storage.
     * @param {Object} turnContext
     */
    async getUploadedAttachment(turnContext) {
        const imageData = fs.readFileSync(path.join(__dirname, '/resources/architecture-resize.png'));
        const connector = turnContext.adapter.createConnectorClient(turnContext.activity.serviceUrl);
        const conversationId = turnContext.activity.conversation.id;
        const response = await connector.conversations.uploadAttachment(conversationId, {
            name: 'architecture-resize.png',
            originalBase64: imageData,
            type: 'image/png'
        });

        // Retrieve baseUri from ConnectorClient for... something.
        const baseUri = connector.baseUri;
        const attachmentUri = baseUri + (baseUri.endsWith('/') ? '' : '/') + `v3/attachments/${ encodeURI(response.id) }/views/original`;
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: attachmentUri
        };
    }
}

exports.AttachmentsBot = AttachmentsBot;
