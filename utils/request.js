module.exports.request = function (method, url, _options) {
    let options = _options || {};
    const qObj = {
        url: url,
        method: method.toUpperCase(),

    };

    switch (options.expect) {
        case 'binary': {
            qObj.dataType = 'binary';
            qObj.responseType = 'arraybuffer';
            break;
        }

        case 'text': {
            qObj.dataType = 'text';
            qObj.responseType = 'text';
            break;
        }

        case 'json':
        default: {
            qObj.dataType = 'json';
            break;
        }
    }

    if (options.header) {
        qObj.header = options.header;
    }

    if (options.body) {
        qObj.data = options.body
    }

    if (options.query) {
        let queryString = Object.keys(options.query || {}).map((x)=> {
            let k = x;
            let v = options.query[k];
            return `${encodeURIComponent(k)}=${v === undefined ? '' : encodeURIComponent(v)}`;
        }).join('&');
        if (qObj.url.includes('?')) {
            qObj.url = qObj.url.replace(/\?/, `?${queryString}&`);
        } else {
            qObj.url = `${qObj.url}?${queryString}`
        }
    }

    return new Promise((resolve, reject) => {
        qObj.success = resolve;
        qObj.fail = reject;
        wx.request(qObj);
    });

}

module.exports.download = function (url, _options) {
    let options = _options || {};
    const qObj = {
        url: url
    };

    if (options.header) {
        qObj.header = options.header;
    }

    if (options.query) {
        let queryString = Object.keys(options.query || {}).map((x)=> {
            let k = x;
            let v = options.query[k];
            return `${encodeURIComponent(k)}=${v === undefined ? '' : encodeURIComponent(v)}`;
        }).join('&');
        if (qObj.url.includes('?')) {
            qObj.url = qObj.url.replace(/\?/, `?${queryString}&`);
        } else {
            qObj.url = `${qObj.url}?${queryString}`
        }
    }

    if (options.filePath) {
        qObj.filePath = filePath;
    }

    return new Promise((resolve, reject) => {
        qObj.success = resolve;
        qObj.fail = reject;
        wx.downloadFile(qObj);
    });

}