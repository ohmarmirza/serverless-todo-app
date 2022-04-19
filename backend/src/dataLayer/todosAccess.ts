import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from "../models/TodoItem"
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todosAccess')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
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
}