/**
 *  Route: GET /notes
 */

const AWS = require('aws-sdk')
const { getResponseHeaders, getUserId } = require('./utils')
AWS.config.update({ region: 'us-east-1' })

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.NOTES_TABLE

exports.handler = async (event) => {
  try {
    let query = event.queryStringParameters
    let limit = query && query.limit ? parseInt(query.limit) : 5
    let user_id = getUserId(event.headers)

    let params = {
      TableName: tableName,
      KeyCondictionExpression: "user_id = :uid",
      ExpressionAttributeValues: {
        ":uid": user_id
      },
      Limit: limit,
      ScanIndexFoward: false
    }
    let startTimestamp = query && query.start ? parseInt(query.start) : 0

    if(startTimestamp > 0) {
      params.ExclusiveStartKey = {
        user_id: user_id,
        timestamp: startTimestamp
      }
    }

    let data = await dynamodb.query(params).promise()

    return {
      statusCode: 200,
      headers: getResponseHeaders()
      body: JSON.stringify(data)
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