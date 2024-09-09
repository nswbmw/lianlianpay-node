## lianlianpay

LianLianPay SDK for Nodejs.

### Install

```sh
$ npm i lianlianpay --save
```

### Usage

```js
const moment = require('moment-timezone')

const Lianlianpay = require('lianlianpay')
const lianlianpayClient = new Lianlianpay({
  merchantId: 'xxx',
  merchantSecretKey: `-----BEGIN PRIVATE KEY-----xxx-----END PRIVATE KEY-----`,
  lianlianPublicKey: '-----BEGIN PUBLIC KEY-----xxx-----END PUBLIC KEY-----',
  environment: 'sandbox' // sandbox|production
})

;(async () => {
  const createPaymentRes = await lianlianpayClient.execute({
    method: 'post',
    url: `/v3/merchants/${lianlianpayClient.merchantId}/payments`,
    params: {
      merchant_transaction_id: 'merchant_transaction_id_1',
      merchant_id: lianlianpayClient.merchantId,
      redirect_url: 'https://www.google.com/search?q=success',
      cancel_url: 'https://www.google.com/search?q=cancel',
      country: 'HK',
      merchant_order: {
        merchant_order_id: 'merchant_order_id_1',
        merchant_user_no: 'merchant_user_no_1',
        merchant_order_time: moment().format('yyyyMMDDHHmmss'),
        order_description: 'order_description_1',
        order_amount: 0.99,
        order_currency_code: 'USD',
        products: [
          {
            product_id: 'product_id_1',
            name: 'name_1',
            price: 0.99,
            quantity: 1
          }
        ]
      }
    }
  })
  /*
  {
    return_code: 'SUCCESS',
    return_message: 'Success',
    trace_id: '2ee9c4f85bb241fb8bc37bc36445e858.102.17257002973994419',
    order: {
      ll_transaction_id: '2024090703021090',
      merchant_transaction_id: 'merchant_transaction_id_1',
      payment_data: {
        payment_currency_code: 'USD',
        payment_amount: '0.99',
        payment_status: 'IN',
        settlement_currency_code: 'HKD'
      },
      payment_url: 'https://gacashier.lianlianpay-inc.com/?key=1pgspblhh12&paymentData=H4sIAAAAAAAAAH1SXU%2FbMBT9K8jaI1CnnYZSaZqg3bRKo0NLeZqm6sa%2BJFYdO%2FJHWYX637kOXUhh%0D%0A8JTknONzfc%2FJAwMRIugb2DVowmVjowlsyvh5nrPTY3IWnUMjdkTfFvO32GLXlFaT5gMpShCb77bB%0D%0AG6iQTe9AezxlAoxAfeuSqA6h9dPRqAQl47mwzch%2FuZefnyRkQEgLZncppUPv6cAztoQGD0D0gYa4%0D%0AhaRveooaTFhHj25t7DojhUQvnGqDsubpCBooNRawxRk4uTB3tr%2FeBtOGWVv5ttR1nY1J%2Fs%2B0mzDm%0D%0A44885xec8%2FGnfMJ5NlD8dBLd0g4vEhwYT1nR8LWS3X1sUiWz3mvCxxm9HKgC3VYJnNXgKhyUwjkd%0D%0Abv%2FfVftGS%2B07%2FRy4IkCIKd3F8hmk798PDGKoV7s2Jb2aFylsyuuKNpKJZ1vlIW0PPtC6RLE%2FJKG1%0D%0ADeqZpdiT6NqKzZkSLnEH85T4HAKw6dGISTfinXIMorxSWitT9f9EcBH3vfM1htqmmhazX2yfJjor%0D%0Ao0jrsLmq1MnZSRfxevBPdJ342t6neSu7QfND%2BdAPTczX6GyL3zRUPRzg78tqCHqV%2FwA7yj7YAPpl%0D%0AiR342mKIHpsEessu8nz%2FCK9zf%2B7KAwAA%0D%0A',
      key: '1pgspblhh12'
    }
  }
   */
  console.log(createPaymentRes)

  const getPaymentRes = await lianlianpayClient.execute({
    method: 'get',
    url: `/v3/merchants/${lianlianpayClient.merchantId}/payments/${createPaymentRes.order.merchant_transaction_id}`,
    params: {
      merchant_id: lianlianpayClient.merchantId,
      merchant_transaction_id: createPaymentRes.order.merchant_transaction_id
    }
  })
  /*
  {
    return_code: 'SUCCESS',
    return_message: 'Success',
    trace_id: '2ee9c4f85bb241fb8bc37bc36445e858.153.17258614898135107',
    order: {
      ll_transaction_id: '2024090703021090',
      merchant_transaction_id: 'merchant_transaction_id_1',
      payment_data: {
        payment_currency_code: 'USD',
        payment_amount: '0.99',
        payment_time: '20240907091404',
        payment_status: 'PS',
        settlement_currency_code: 'HKD',
        installments: '1',
        account_date: '20240907'
      },
      payment_url: 'https://gacashier.lianlianpay-inc.com/?key=1pgspblhh12&paymentData=H4sIAAAAAAAAAH1SXU%2FbMBT9K8jaI1CnnYZSaZqg3bRKo0NLeZqm6sa%2BJFYdO%2FJHWYX637kOXUhh%0D%0A8JTknONzfc%2FJAwMRIugb2DVowmVjowlsyvh5nrPTY3IWnUMjdkTfFvO32GLXlFaT5gMpShCb77bB%0D%0AG6iQTe9AezxlAoxAfeuSqA6h9dPRqAQl47mwzch%2FuZefnyRkQEgLZncppUPv6cAztoQGD0D0gYa4%0D%0AhaRveooaTFhHj25t7DojhUQvnGqDsubpCBooNRawxRk4uTB3tr%2FeBtOGWVv5ttR1nY1J%2Fs%2B0mzDm%0D%0A44885xec8%2FGnfMJ5NlD8dBLd0g4vEhwYT1nR8LWS3X1sUiWz3mvCxxm9HKgC3VYJnNXgKhyUwjkd%0D%0Abv%2FfVftGS%2B07%2FRy4IkCIKd3F8hmk798PDGKoV7s2Jb2aFylsyuuKNpKJZ1vlIW0PPtC6RLE%2FJKG1%0D%0ADeqZpdiT6NqKzZkSLnEH85T4HAKw6dGISTfinXIMorxSWitT9f9EcBH3vfM1htqmmhazX2yfJjor%0D%0Ao0jrsLmq1MnZSRfxevBPdJ342t6neSu7QfND%2BdAPTczX6GyL3zRUPRzg78tqCHqV%2FwA7yj7YAPpl%0D%0AiR342mKIHpsEessu8nz%2FCK9zf%2B7KAwAA%0D%0A'
    }
  }
   */
  console.log(getPaymentRes)
})().catch(console.error)
```

### LianLianPay Docs

- 对接流程: [https://doc.lianlianpay.com/pay-guide/flow-step/resume](https://doc.lianlianpay.com/pay-guide/flow-step/resume)
- api文档: [https://doc.lianlianpay.com/doc-api/open-api/pay-order](https://doc.lianlianpay.com/doc-api/open-api/pay-order)
