import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

function ensureWlan(generator) {
  generator.definitions_['import_network'] = 'import network';
  generator.definitions_['import_time_network'] = 'import time';
  generator.definitions_['wlan'] =
    'wlan = network.WLAN(network.STA_IF)\nwlan.active(True)';
}

pythonGenerator.forBlock['network_wifi_connect'] = function (block, generator) {
  ensureWlan(generator);
  const ssid = generator.valueToCode(block, 'SSID', ORDER_ATOMIC) || "''";
  const password = generator.valueToCode(block, 'PASSWORD', ORDER_ATOMIC) || "''";
  return (
    `wlan.connect(${ssid}, ${password})\n` +
    `while not wlan.isconnected():\n` +
    `    time.sleep_ms(200)\n`
  );
};

pythonGenerator.forBlock['network_wifi_is_connected'] = function (block, generator) {
  ensureWlan(generator);
  return ['wlan.isconnected()', ORDER_ATOMIC];
};

pythonGenerator.forBlock['network_wifi_ip'] = function (block, generator) {
  ensureWlan(generator);
  return ['wlan.ifconfig()[0]', ORDER_ATOMIC];
};

pythonGenerator.forBlock['network_http_get'] = function (block, generator) {
  generator.definitions_['import_urequests'] = 'import urequests';
  const url = generator.valueToCode(block, 'URL', ORDER_ATOMIC) || "''";
  return [`urequests.get(${url}).text`, ORDER_ATOMIC];
};

pythonGenerator.forBlock['network_http_post'] = function (block, generator) {
  generator.definitions_['import_urequests'] = 'import urequests';
  const url = generator.valueToCode(block, 'URL', ORDER_ATOMIC) || "''";
  const body = generator.valueToCode(block, 'BODY', ORDER_ATOMIC) || "''";
  return [`urequests.post(${url}, data=${body}).text`, ORDER_ATOMIC];
};
