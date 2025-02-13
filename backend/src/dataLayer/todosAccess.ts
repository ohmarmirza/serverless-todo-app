import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from "../models/TodoItem"
import { TodoUpdate } from '../models/TodoUpdate'
import { Types } from 'aws-sdk/clients/s3'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todosAccess')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION || 3000) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info(`TodosAccess - Getting all todos for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async getTodo(todoId: string, userId: string): Promise<Boolean> {
        logger.info(`TodosAccess - Getting todo ${todoId} for user ${userId}`)

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        }).promise()

        return !!result.Item
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {

        logger.info('TodosAccess - Creating a new todo ', todoItem)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate) {

        logger.info(`TodosAccess - Updating todo ${todoId} for user ${userId}`, todoUpdate)

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #done = :done, #dueDate = :dueDate, #name = :name",
            ExpressionAttributeNames: {
                '#done': 'done',
                '#dueDate': 'dueDate',
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':done': todoUpdate.done,
                ':dueDate': todoUpdate.dueDate,
                ':name': todoUpdate.name
            },
            ReturnValues: 'ALL_NEW'
        }).promise()

        logger.info(`TodosAccess - Result of updating todo ${todoId} for user ${userId}`, result);
    }
    async deleteTodo(todoId: string, userId: string) {

        logger.info(`TodosAccess - Deleting todo ${todoId} for user ${userId}`)

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        }).promise()

        logger.info(`TodosAccess - Result of deleting todo ${todoId} for user ${userId}`, result)
    }
    createAttachmentPresignedUrl(todoId: string): string {

        logger.info(`TodosAccess - Creating Attachment PresignedUrl for todo ${todoId}`)

        return this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: Number(this.urlExpiration)
        })

    }
}