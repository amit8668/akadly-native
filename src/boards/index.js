import { esp32 } from './esp32.js';
import { esp32s3 } from './esp32_s3.js';
import { esp8266 } from './esp8266.js';
import { rpiPico } from './rpi_pico.js';
import { stm32 } from './stm32.js';

export const boards = [esp32, esp32s3, esp8266, rpiPico, stm32];

export function getBoard(id) {
  return boards.find((b) => b.id === id) || boards[0];
}
