export const crc16xmodem = (buf, previous) => {
    if (!Buffer.isBuffer(buf)) {
        buf = new Buffer()
    }

    let crc = typeof previous !== 'undefined' ? ~~previous : 0x0;

    for (let index = 0; index < buf.length; index++) {
        const byte = buf[index];
        let code = (crc >>> 8) & 0xff;

        code ^= byte & 0xff;
        code ^= code >>> 4;
        crc = (crc << 8) & 0xffff;
        crc ^= code;
        code = (code << 5) & 0xffff;
        crc ^= code;
        code = (code << 7) & 0xffff;
        crc ^= code;
    }

    return crc;
};
