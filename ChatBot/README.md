# ChatBot for poem generator

This bot has been created using [Microsoft Bot Framework][1]. It allow users to retrieve generated poems by typing texutal keywords, typing hyperlink of a image or uploading image attachments.

## Prerequisites
- [Node.js][4] version 10.14 or higher
    ```bash
    # determine node version
    node --version
    ```

# Start the Chatbot API
- Clone the repository
    ```bash
    git clone https://github.com/Epoch-Mengying/Generating-Poetry-with-Chatbot.git
    ```
- In a terminal, navigate to `ChatBot/`
    ```bash
    cd ChatBot/
    ```
- Install modules
    ```bash
    npm install
    ```
- Start the bot
    ```bash
    npm start
    ```
- The ChatBot API is listening on port 3748 now

# Testing the bot using Bot Framework Emulator **v4**
[Microsoft Bot Framework Emulator][5] is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.2.0 or greater from [here][6]

## Connect to the bot using Bot Framework Emulator **v4**
- Launch Bot Framework Emulator
- File -> Open Bot Configuration
- Navigate to `samples/javascript_nodejs/15.handling-attachments` folder
- Select `handling-attachments.bot` file

# Attachments
A message exchange between user and bot may contain cards and media attachments, such as images, video, audio, and files.
The types of attachments that may be sent and received varies by channel. Additionally, a bot may also receive file attachments.



# Further reading
To learn more about creating a chatbot and deploying on the Azure cloud service, please visit the following links.
- [Bot Framework Documentation][20]
- [Bot Basics][32]
- [Attachments][23]
- [Activity processing][25]
- [Azure Bot Service Introduction][21]
- [Azure Bot Service Documentation][22]
- [Azure CLI][7]
- [msbot CLI][9]
- [Azure Portal][10]
- [Language Understanding using LUIS][11]
- [Restify][30]
- [dotenv][31]

[1]: https://dev.botframework.com
[4]: https://nodejs.org
[5]: https://github.com/microsoft/botframework-emulator
[6]: https://github.com/Microsoft/BotFramework-Emulator/releases
[7]: https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest
[8]: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest
[9]: https://github.com/Microsoft/botbuilder-tools/tree/master/packages/MSBot
[10]: https://portal.azure.com
[11]: https://www.luis.ai
[20]: https://docs.botframework.com
[21]: https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0
[22]: https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0

[23]: https://docs.microsoft.com/en-us/azure/bot-service/nodejs/bot-builder-nodejs-send-receive-attachments?view=azure-bot-service-4.0
[25]: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0
[30]: https://www.npmjs.com/package/restify
[31]: https://www.npmjs.com/package/dotenv
[32]: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0
[40]: https://aka.ms/azuredeployment
[41]: ./PREREQUISITES.md
