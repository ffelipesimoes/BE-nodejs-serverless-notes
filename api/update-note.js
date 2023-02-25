/**
 *  Route: PATCH /note/n/{note_id}
 */

const AWS = require('aws-sdk')
const moment = require('moment')
const uuidv4 = require('uuid/v4')
const { getResponseHeaders, getUserId, getUserName } = require('./utils')
AWS.config.update({ region: 'us-east-1' })

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.NOTES_TABLE

exports.handler = async (event) => {
  try {
    let item = JSON.parse(event.body).Item
    item.user_id = getUserId(event.headers)
    item.user_name = getUserName(event.headers)
    item.expires = moment().add(90, 'days').unix()

    let data = await dynamodb.put({
      TableName: tableName,
      Item: item,
      ConditionExpression: '#t = :t',
      ExpressionAttributeNames: {
        '#t': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':t': item.timestamp
      }
    }).promise()

    return {
      statusCode: 200,
      headers: getResponseHeaders()
      body: JSON.stringify(item)
    }

  } catch (err) {
      console.log("Error", err)
      return {
        statusCode: err.statusCode ? err.statusCode : 500,
        headers: getResponseHeaders()
        body: JSON.stringify({
          error: err.name ? err.name : "Exception",
          message: err.message ? err.message : "Unknown error"
        })
      }
  }
}