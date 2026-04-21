// Lamport Logical Clock implementation
let logicalClockTime = 0;

const tick = () => {
  logicalClockTime += 1;
  return logicalClockTime;
};

const update = (receivedTime) => {
  logicalClockTime = Math.max(logicalClockTime, receivedTime) + 1;
  return logicalClockTime;
};

const getTime = () => {
  return logicalClockTime;
};

const reset = () => {
  logicalClockTime = 0;
};

module.exports = {
  tick,
  update,
  getTime,
  reset,
};
