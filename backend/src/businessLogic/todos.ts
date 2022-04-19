import { TodosAccess } from "../dataLayer/todosAccess";
import { TodoItem } from "../models/TodoItem";
import { createLogger } from "../utils/logger";

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Todos - Retrieving all todos for user ${userId}`, { userId })
    return todosAccess.getTodosForUser(userId)
} 