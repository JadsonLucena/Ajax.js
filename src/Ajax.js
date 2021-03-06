function Ajax(url, {
    async = true,
    body = null,
    headers = {},
    method = 'GET',
    mimeType = 'text/plain',
    password = null,
    responseType = 'text',
    timeout = 0,
    user = null,
    withCredentials = false,
    aborted = e => console.log('aborted', e),
    end = e => console.log('end', e),
    error = e => console.log('error', e),
    progress = e => console.log('progress', e),
    readystate = e => console.log('readystate', e),
    start = e => console.log('start', e),
    success = e => console.log('success', e),
    timeouted = e => console.log('timeouted', e),
    XHR = e => console.log('XHR', e)
} = {}) {

    url = url.trim();
    method = method.trim().toUpperCase();
    mimeType = mimeType.trim().toLowerCase();
    password = password?.trim();
    responseType = responseType.trim().toLowerCase();
    timeout = parseInt(timeout);
    user = user?.trim();

    let xhr = new XMLHttpRequest();

    xhr.open(method, url, async, user, password);

    headers = new Headers(headers);
    for (let header of headers.keys()) {

        xhr.setRequestHeader(header, headers.get(header));

    }

    xhr.overrideMimeType(mimeType);

    xhr.responseType = responseType;

    xhr.timeout = timeout;

    xhr.withCredentials = withCredentials;

    let scope = (/^(GET|HEAD)$/i.test(method.trim()) ? xhr : xhr.upload);

    xhr.onloadend = e => end(e.timeStamp);

    xhr.onloadstart = e => start(e.timeStamp);

    scope.onprogress = e => progress({ lengthComputable: e.lengthComputable, loaded: e.loaded, total: e.total, timeStamp: e.timeStamp });

    let _state = e => ({ readyState: xhr.readyState, status: xhr.status, statusText: xhr.statusText, timeStamp: e.timeStamp });

    xhr.onreadystatechange = e => readystate(_state(e));

    return new Promise((resolve, reject) => {

        let _success = e => ({ ..._state(e), getAllResponseHeaders: () => xhr.getAllResponseHeaders(), getResponseHeader: (header) => xhr.getResponseHeader(header), response: xhr.response, XHR: xhr }),
            _error = e =>   ({ ..._state(e), type: e.type, XHR: xhr });

        scope.onabort = e => { aborted(e.timeStamp); reject(_error(e)); };
        scope.onerror = e => { error(_error(e)); reject(_error(e)); };
        xhr.onload = e => { success(_success(e)); resolve(_success(e)); };
        scope.ontimeout = e => { timeouted(e.timeStamp); reject(_error(e)); };

        xhr.send(body);

        XHR({ abort: () => xhr.abort(), XHR: xhr });

    });

};