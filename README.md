# Metal Pipe Player
A Discord bot that repeatedly plays an audio file in a random interval. You can [invite the public version](https://discord.com/api/oauth2/authorize?client_id=1086952097301405806&permissions=8&scope=applications.commands%20bot) of the bot (might be offline) or self host it.

## Installation (self host)
1. Install [Node.js](https://nodejs.org/en).
2. Clone the GitHub repository.
3. Create a Discord application. [(click here)](https://discord.com/developers/applications "click here")
4. Open the application and go to **Bot** (on the left sidebar).
5. Click **Reset Token** and enter your password (or 2FA code if you have it enabled) and copy token.
<!-- 6. Scroll down to **Privileged Gateway Intents** and enable **Message Content Intent** -->
1. Go to **OAuth2** and **URL Generator**, on **Scopes** select **bot** and select **Connect** and **Speak** (located on the Voice Permissions section) and invite the bot using the generated url.
2. Create a `.env` file and type `TOKEN=REPLACE_THIS_WITH_YOUR_TOKEN`, so it should look like `TOKEN=MTA2NjYyNTg0MzUyNDI3MjIxMg.GkLoPp.iA0UM1JXHp4FgK7952C_L9JNXrpXhMMyoL4Hfc`.
3. On the terminal, run `npm run start`.

## Usage

#### Inviting the bot to a voice channel
Join a voice channel and use `/play`

#### Changing audio
Type `/list` to see a list of available audio(s) to play.
Use `/play <index>` to play the selected audio.

#### Adding your own audio (self-host only)
1. Add your audio to the audio folder
2. Open **audios.json** located in the **config** folder
3. Create a new object
4. Fill the **path** with `audio/FILE_NAME.mp3`
5. Fill the **name** and **src** with whatever you want
6. Your audio should be visible in the library

#### Disconnecting the bot from a voice channel
Use `/disconnect`

#### Changing random interval delay
Use `/delay show` to show the current delay

Use `/delay <min> <max>` to set the random interval to a random value between **min** and **max**
