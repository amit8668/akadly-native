export const esp32 = {
  id: 'esp32',
  label: 'ESP32',
  description:
    'A dual-core WiFi + Bluetooth microcontroller with plenty of GPIO, ' +
    'analog inputs, and PWM channels. A solid default choice for most ' +
    'MicroPython projects that need networking.',
  pinout: '/pinouts/esp32.svg',
  // Category ids this board's toolbox includes, in display order.
  categories: [
    'timing',
    'gpio',
    'displays',
    'sensors',
    'communication',
    'files',
    'network',
    'control',
    'python',
  ],
};
