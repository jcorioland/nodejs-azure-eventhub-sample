const utf8 = require('utf8');
const crypto = require('crypto');

function createSharedAccessToken(host, keyName, keyValue) {
    if (!host || !keyName || !keyValue) {
        throw "Missing required parameter";
    }

    var encoded = encodeURIComponent(host);
    var now = new Date();
    var week = 60*60*24*7;
    var ttl = Math.round(now.getTime() / 1000) + week;
    var signature = encoded + '\n' + ttl;
    var signatureUTF8 = utf8.encode(signature);
    var hash = crypto.createHmac('sha256', keyValue).update(signatureUTF8).digest('base64');

    return 'SharedAccessSignature sr=' + encoded + '&sig=' +
        encodeURIComponent(hash) + '&se=' + ttl + '&skn=' + keyName;
};

exports.createSharedAccessToken = createSharedAccessToken;