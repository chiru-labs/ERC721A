export const assert = (value, errMsg) => {
  if (!value) {
    throw errMsg
  }
};

export const assertBuffer = (keyBuffer, errMsg) => {
  if (!Buffer.isBuffer(keyBuffer)) {
    throw errMsg
  }
};
