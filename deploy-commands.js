const { REST, Routes } = require('discord.js');
const { readdirSync, statSync } = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

const commandsPath = path.join(__dirname, 'commands');

// Recursively read command files (including subfolders)
function loadCommands(folderPath) {
  const files = readdirSync(folderPath, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(folderPath, file.name);
    if (file.isDirectory()) {
      loadCommands(fullPath); 
    } else if (file.name.endsWith('.js')) {
      const command = require(fullPath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[WARNING] The command at ${fullPath} is missing "data" or "execute".`);
      }
    }
  }
}

// Load all commands
loadCommands(commandsPath);

// Initialize REST API
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy the commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
