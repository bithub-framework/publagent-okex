import crc32 from 'crc-32';

function checksum(data: any) {
    if (data == null || data == undefined) {
        return false;
    }
    let result = data;
    if (typeof data === 'string') {
        result = JSON.parse(data);
    }
    if (result.data && result.data.length > 0) {
        const item = result.data[0];
        const buff = [];
        for (let i = 0; i < 25; i++) {
            if (item.bids[i]) {
                const bid = item.bids[i];
                buff.push(bid[0]);
                buff.push(bid[1]);
            }
            if (item.asks[i]) {
                const ask = item.asks[i];
                buff.push(ask[0]);
                buff.push(ask[1]);
            }
        }
        const checksum = crc32.str(buff.join(':'));
        if (checksum === item.checksum) {
            return true;
        }
    }
    return false;
}

export {
    checksum as default,
    checksum,
}