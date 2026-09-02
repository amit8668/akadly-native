import * as Blockly from 'blockly/core';
import 'blockly/blocks'; // registers Blockly's own standard block set
import { pythonGenerator } from 'blockly/python';
import * as En from 'blockly/msg/en';

import './blocks/gpio.js';
import './blocks/timing.js';
import './blocks/sensors.js';
import './blocks/displays.js';
import './blocks/network.js';
import './blocks/files.js';
import './blocks/control.js';
import './blocks/communication.js';
import './blocks/databoard.js';
import './generators/python/gpio.js';
import './generators/python/timing.js';
import './generators/python/sensors.js';
import './generators/python/displays.js';
import './generators/python/network.js';
import './generators/python/files.js';
import './generators/python/control.js';
import './generators/python/communication.js';
import './generators/python/databoard.js';
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

export function setWorkspaceBoard(workspace, board) {
  workspace.updateToolbox(buildToolbox(board));
}
