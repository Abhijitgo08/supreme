// MedAuth AI - services/eventBus.js - EventEmitter singleton for orchestrator events
const EventEmitter = require('events');

class MedAuthEventBus extends EventEmitter {}

const eventBus = new MedAuthEventBus();

module.exports = eventBus;
