import { EventEmitter } from 'events';

const listingEmitter = new EventEmitter();

listingEmitter.setMaxListeners(20);

export default listingEmitter;
