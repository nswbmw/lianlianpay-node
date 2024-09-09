const crypto = require('crypto')

const HttpError = require('http-errors')
const moment = require('moment-timezone')
const request = require('request-promise')
const HttpsProxyAgent = require('https-proxy-agent')
const { SocksProxyAgent } = require('socks-proxy-agent')
const sortKeys = require('sort-keys')

function LianLianPay (options = {}) {
  this.merchantId = options.merchantId || options.merchant_id
  this.merchantSecretKey = options.merchantSecretKey || options.merchant_secretKey
  this.lianlianPublicKey = options.lianlianPublicKey || options.lianlian_publicKey
  this.environment = options.environment || 'sandbox'
  this.timezone = options.timezone || 'UTC'
  this.version = options.version || '1.0.0'

  if (!this.merchantSecretKey || !this.lianlianPublicKey) {
    throw new Error('No merchantSecretKey or lianlianPublicKey')
  }

  const proxy = options.proxy
  if (proxy) {
    if (typeof proxy === 'string') {
      if (proxy.startsWith('http://')) {
        this.agent = new HttpsProxyAgent(proxy)
      } else if (proxy.startsWith('socks://')) {
        this.agent = new SocksProxyAgent(proxy)
      }
    } else if (typeof proxy === 'object') {
      if (!['http', 'socks'].includes(proxy.protocol)) {
        throw new Error('proxy.protocol must be one of ["http", "socks"]')
      }
      this.agent = (proxy.protocol === 'http')
        ? new HttpsProxyAgent((proxy.username && proxy.password)
          ? `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
          : `http://${proxy.host}:${proxy.port}`
        )
        : new SocksProxyAgent((proxy.username && proxy.password)
          ? `socks://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
          : `socks://${proxy.host}:${proxy.port}`
        )
    }
  }

  return this
}

LianLianPay.prototype._getURL = function _getURL (url) {
  url = url.replace(/^\//, '')
  return (this.environment === 'sandbox')
    ? `https://celer-api.lianlianpay-inc.com/${url}`
    : `https://gpapi.lianlianpay.com/${url}`
}

LianLianPay.prototype._getSignature = function _getSignature (privateKey, obj) {
  const sortedObj = sortKeys(obj, { deep: true })
  const signatureRawStr = getLeafNodes(sortedObj).join('&')

  return getRSASha1(privateKey, signatureRawStr)
}

LianLianPay.prototype._verifySignature = function _verifySignature (publicKey, signature, obj) {
  const sortedObj = sortKeys(obj, { deep: true })
  const signatureRawStr = getLeafNodes(sortedObj).join('&')

  return verifyRSASha1(publicKey, signature, signatureRawStr)
}

LianLianPay.prototype.execute = async function execute ({ method = 'get', url, headers = {}, params = {} }) {
  // generate request signature
  const signature = await this._getSignature(this.merchantSecretKey, params)
  const payload = {
    method,
    url: this._getURL(url),
    json: true,
    headers: Object.assign({
      signature,
      timezone: this.timezone,
      timestamp: moment().tz(this.timezone).format('yyyyMMDDHHmmss'),
      version: this.version
    }, headers),
    agent: this.agent,
    resolveWithFullResponse: true
  }

  if (method.toLowerCase() !== 'get') {
    payload.body = params
  }

  const res = await request(payload)

  // verify response signature
  if (!this._verifySignature(this.lianlianPublicKey, res.headers.signature, res.body)) {
    throw HttpError(403, 'Invalid Response Signature')
  }

  return res.body
}

module.exports = LianLianPay

function getLeafNodes (obj) {
  const result = []

  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      result.push(...getLeafNodes(obj[key], key))
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach((item) => {
        result.push(...getLeafNodes(item))
      })
    } else {
      result.push(`${key}=${obj[key]}`)
    }
  }

  return result
}

function getRSASha1 (privateKey, data) {
  const signer = crypto.createSign('RSA-SHA1')
  signer.update(data)
  signer.end()

  return signer.sign(privateKey, 'base64')
}

function verifyRSASha1 (publicKey, signature, data) {
  const verifier = crypto.createVerify('RSA-SHA1')
  verifier.update(data)
  verifier.end()

  return verifier.verify(publicKey, signature, 'base64')
}
