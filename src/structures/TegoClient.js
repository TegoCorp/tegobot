const fs = require('fs');
const { join } = require('path');
const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');
const { Client, Collection } = require('discord.js');

require('../extensions');
const repository = require('../repository');
const { bot: config, spotify } = require('../config');

/** Clase TegoClient */
module.exports = class TegoClient extends Client {
  /**
   * Constructor de la clase TegoClient
   * @param {Object} opt
   */
  constructor(opt) {
    super(opt);
    this.repository = repository;
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.manager = new Manager({
      plugins: [
        new Spotify({
          clientID: spotify.clientID,
          clientSecret: spotify.clientSecret,
        }),
      ],
      nodes: config.lavalinkNodes,
      send: (id, payload) => {
        const guild = this.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });
  }

  /** Registra los comandos en la colección commands */
  addCommandsToCollection() {
    const commandFiles = fs
      .readdirSync(join(__dirname, '..', 'commands'))
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      this.commands.set(command.name, command);
    }
  }

  /** Prepara los eventos del cliente y erela */
  _setupEventListeners() {
    const clientListeners = fs
      .readdirSync(join(__dirname, '..', 'listeners', 'client'))
      .filter((file) => file.endsWith('.js'));

    const managerListeners = fs
      .readdirSync(join(__dirname, '..', 'listeners', 'manager'))
      .filter((file) => file.endsWith('.js'));

    for (const file of clientListeners) {
      const listener = require(`../listeners/client/${file}`);

      this.on(listener.name, (...args) => listener.execute(this, ...args));
    }

    for (const file of managerListeners) {
      const listener = require(`../listeners/manager/${file}`);

      this.manager.on(listener.name, (...args) =>
        listener.execute(this, ...args)
      );
    }
  }

  /** Inicializa el cliente discord.js con Lavalink (erela) */
  initialize() {
    this.login(config.token);
    this._setupEventListeners();
    this.addCommandsToCollection();
  }
};
