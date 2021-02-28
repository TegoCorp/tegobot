const { MessageEmbed } = require('discord.js');

const setupEmbed = (channel) =>
  new MessageEmbed()
    .setColor('76AC00')
    .addField(
      'Canal de gestión creado',
      `Nombre del canal: ${channel}` +
        '\nPuedes renombrar y mover el canal a tu gusto.'
    )
    .setFooter('Para obtener ayuda sobre mis comandos debes utilizar !help');

module.exports = { setupEmbed };
