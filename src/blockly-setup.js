import * as Blockly from 'blockly/core';
import 'blockly/blocks'; // registers Blockly's own standard block set
import { pythonGenerator } from 'blockly/python';
import * as En from 'blockly/msg/en';

import './blocks/gpio.js';
import './blocks/timing.js';
import './generators/python/gpio.js';
import './generators/python/timing.js';
import { buildToolbox } from './toolbox/build-toolbox.js';

Blockly.setLocale(En);

export function createWorkspace(container, board) {
  return Blockly.inject(container, {
    toolbox: buildToolbox(board),
    trashcan: true,
    zoom: { controls: true, wheel: true },
    grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
  });
}

export function generatePython(workspace) {
  return pythonGenerator.workspaceToCode(workspace);
}
