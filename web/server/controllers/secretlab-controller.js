import { Session } from '../../shared/models/index.js'
import HttpError from '../../shared/utils/http-error.js'

export const iterateAllStores = async (callback) => {
  const limit = 50 // Define the number of sessions per page
  let lastId = null
  const failedUpdates = [] // Array to collect shops with failed updates
  let countFailedUpdates = 0
  let countSuccessUpdates = 0

  try {
    while (true) {
      const query = lastId ? { _id: { $gt: lastId } } : {}
      const sessions = await Session.find(query).sort({ _id: 1 }).limit(limit)

      if (!sessions || sessions.length === 0) {
        break // Exit the loop if no more sessions are found
      }

      for (const currSession of sessions) {
        try {
          await callback(currSession)
        } catch (error) {
          failedUpdates.push({ shop: currSession.shop, error: error.message }) // Collect the shop with the error
          countFailedUpdates++
          countSuccessUpdates++
        }
      }

      lastId = sessions[sessions.length - 1]._id
    }

    return {
      success: true,
      failedUpdates,
      countFailedUpdates,
      countSuccessUpdates
    }
  } catch (error) {
    console.error(error)
    throw new HttpError(`Failed to iterate all stores: ${error.message}`, 500)
  }
}
