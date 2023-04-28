# Metal Pipe Player
goofy ass bot that has no reason other than to annoy people.
infinite amounts of silence occasionally broken by metal pipe falling

## Installation
1. Install [Node.js](https://nodejs.org/en)
2. Clone the GitHub repository
3. Create a discord application. [(click here)](https://discord.com/developers/applications "click here")
4. Open the application and go to **Bot** (on the left sidebar) and click **Add Bot**
5. Click **Reset Token** and enter 2FA code if you have it enabled and copy token
<!-- 6. Scroll down to **Privileged Gateway Intents** and enable **Message Content Intent** -->
6. Go to **OAuth2** and **URL Generator**, on **Scopes** select **bot** and select **Connect** and **Speak** (its on the Voice Permissions section) and invite the bot using the generated url
7. Create a `.env` file and type `TOKEN=REPLACE_THIS_WITH_YOUR_TOKEN` so it should look something like `TOKEN=MTA2NjYyNTg0MzUyNDI3MjIxMg.GkLoPp.iA0UM1JXHp4FgK7952C_L9JNXrpXhMMyoL4Hfc`
8. On the terminal, run `npm install` and `node .`

## Usage

#### Inviting the bot to a voice channel
Join a voice channel and use `/play`

#### Changing audio
Type `/list` to see a list of available audio(s) to play.
Use `/play <index>` to play the selected audio.

> **Note** Bot will play the selected audio only after the current audio has ended or the bot rejoins the vc

#### Adding your own audio
1. Add your audio to the audio folder
2. Open **audios.json** located in the **config** folder
3. Create a new object
4. Fill the **path** with `audio/FILE_NAME.mp3`
5. Fill the **name** and **src** with whatever you want
6. Your audio should be visible in the library

#### Disconnecting the bot from a voice channel
Use `/disconnect`
