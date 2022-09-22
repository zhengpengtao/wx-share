 
var express = require('express');
var router = express.Router();
var request = require('request');
const sha1 = require('sha1');
 
 
var AppID = '微信公众号appID';
var AppSecret = '微信公众号AppSecret';
 
var getJsapiTicketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
let CACHE = {
    AppID: AppID
}
 
 
//获取access_token
router.get('/', function (req, res, next) {
    const { url } = req.query
    request.get({
            url: 'https://api.weixin.qq.com/cgi-bin/token?appid=' + AppID + '&secret=' + AppSecret + '&grant_type=client_credential',
        },
        function (error, response, body) {
            if (response.statusCode == 200) {
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                let nonceStr = createNonceStr();
                let timestamp = createTimestamp();
                CACHE.openid = openid;
                CACHE.nonceStr = nonceStr;
                CACHE.timestamp = timestamp;
                CACHE.accessToken = access_token;
                CACHE.accessTokenTimeout = body.expires_in * 500;
                CACHE.accessTokenTime = new Date();
                refreshJsapiTicket(access_token, function (ticket) {
                    CACHE.signature = createSign({ //编码获取到签名
                        jsapi_ticket: ticket,
                        nonceStr,
                        timestamp,
                        url
                    });
 
                    console.log(CACHE, 555)
                    res.send(CACHE);
                })
            } else {
                console.log(response.statusCode, 'error');
            }
        }
    );
});
 
/**
 * 获取Jsapi_ticket
 */
function refreshJsapiTicket(access_token, fn) { // Jsapi_ticket 
    let ticketUrl = `${getJsapiTicketUrl}?access_token=${access_token}&type=jsapi`;
    console.log(ticketUrl, 'ticketUrl')
    request.get(ticketUrl, function (err, response, content) {
        content = JSON.parse(content);
        console.error('refreshJsapiTicket', content);
        if (content && (content.errcode == 0 || !content.errcode)) {
            CACHE.ticket = content.ticket;
            CACHE.ticketTimeout = content.expires_in * 500;
            CACHE.accessTokenTime = new Date();
            fn(content.ticket)
        }
    })
};
 
/** 
 * 随机字符串 
 */
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
};
 
/** 
 * 时间戳 
 */
function createTimestamp() {
    return parseInt(new Date().getTime() / 1000).toString();
};
/** 
 * 拼接字符串 
 * @param {*} args 
 */
function rawString(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};
 
/**
 * 新的
 * @param {*} config 
 */
function createSign(config) {
    var ret = {
        jsapi_ticket: config.jsapi_ticket,
        nonceStr: config.nonceStr,
        timestamp: config.timestamp,
        url: config.url
    };
    let url = ret.url;
    let index = url.indexOf('#');
    let res = Object.assign({}, ret, {
        url: index > -1 ? url.substr(0, index) : url
    });
    var string = rawString(res);
    var shaObjs = sha1(string);
    return shaObjs;
}
 
module.exports = router;