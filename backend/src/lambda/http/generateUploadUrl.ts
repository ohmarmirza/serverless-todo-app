import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Handler - Processing generateUploadUrl event', { event })
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const uploadUrl = await createAttachmentPresignedUrl(todoId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }

  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
