import { EventEmitter } from 'events';
import { EventsEnum } from '../../enum/events.enum';

export const eventEmitter = new EventEmitter();

eventEmitter.on(EventsEnum.sendEmail, async (fn) => {
  await fn();
});
