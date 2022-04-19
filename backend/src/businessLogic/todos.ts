import * as uuid from 'uuid'
import { TodosAccess } from "../dataLayer/todosAccess";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { createLogger } from "../utils/logger";

const todosAccess = new TodosAccess()
const logger = createLogger('todos')
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Todos - Retrieving all todos for user ${userId}`, { userId })
    return await todosAccess.getTodosForUser(userId)
}

export async function createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4()

    const todoItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: request.name,
        dueDate: request.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    logger.info(`Todos - Creating todo ${todoId} for user ${userId}`, { todoItem })

    return await todosAccess.createTodo(todoItem)
} 