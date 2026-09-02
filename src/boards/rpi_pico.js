export const rpiPico = {
  id: 'rpi_pico',
  label: 'Raspberry Pi Pico',
  // Base Pico has no WiFi hardware (that's Pico W only), so 'network' is
  // left out here rather than shown as a non-functional category.
  categories: ['gpio', 'timing', 'sensors', 'displays', 'files', 'control', 'communication'],
};
