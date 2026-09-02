import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'network_wifi_connect',
    message0: 'connect to WiFi network %1 password %2',
    args0: [
      { type: 'input_value', name: 'SSID', check: 'String' },
      { type: 'input_value', name: 'PASSWORD', check: 'String' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 20,
    tooltip: 'Connect to a WiFi network and wait until connected.',
  },
  {
    type: 'network_wifi_is_connected',
    message0: 'WiFi is connected',
    output: 'Boolean',
    colour: 20,
    tooltip: 'True if currently connected to a WiFi network.',
  },
  {
    type: 'network_wifi_ip',
    message0: "this device's IP address",
    output: 'String',
    colour: 20,
    tooltip: "The device's current IP address on the WiFi network.",
  },
  {
    type: 'network_http_get',
    message0: 'HTTP GET %1',
    args0: [{ type: 'input_value', name: 'URL', check: 'String' }],
    output: 'String',
    colour: 20,
    tooltip: 'Fetch a URL and return the response body as text.',
  },
  {
    type: 'network_http_post',
    message0: 'HTTP POST %1 body %2',
    args0: [
      { type: 'input_value', name: 'URL', check: 'String' },
      { type: 'input_value', name: 'BODY', check: 'String' },
    ],
    output: 'String',
    colour: 20,
    tooltip: 'POST a body to a URL and return the response text.',
  },
]);
