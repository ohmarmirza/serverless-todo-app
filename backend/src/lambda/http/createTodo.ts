import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Handler - Processing createTodo event', { event })

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const newTodoCreated = await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        newTodoCreated
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
