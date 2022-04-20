import * as uuid from 'uuid'
import { TodosAccess } from "../dataLayer/todosAccess";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from "../utils/logger";

const todosAccess = new TodosAccess()
const logger = createLogger('todos')
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Todos - Retrieving all todos for user ${userId}`, { userId })
    return await todosAccess.getTodosForUser(userId)
}

export async function createTodo(userId: string, request: CreateTodoRequest): Promise<TodoItem> {

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

    logger.info(`Todos - Creating todo ${todoId} for user ${userId}`, { todoItem: todoItem })

    return await todosAccess.createTodo(todoItem)
}
export async function updateTodo(todoId: string, userId: string, request: UpdateTodoRequest) {

    const todoUpdate: TodoUpdate = {
        name: request.name,
        dueDate: request.dueDate,
        done: request.done
    }

    logger.info(`Todos - Updating todo ${todoId} for user ${userId}`, { todoUpdate: todoUpdate })

    await todosAccess.updateTodo(todoId, userId, todoUpdate)
}

export async function deleteTodo(todoId: string, userId: string) {
    logger.info(`Todos - Deleting todo ${todoId} for user ${userId}`)

    await todosAccess.deleteTodo(todoId, userId)
}
export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info(`Todos - Creating Attachment PresignedUrl for todo ${todoId} for user ${userId}`)

    const todoExists = await todosAccess.getTodo(todoId, userId);

    if (!todoExists) {
        throw new Error(`todo ${todoId} for user ${userId} does not exist`)
    }

    return todosAccess.createAttachmentPresignedUrl(todoId)
}