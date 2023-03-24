import Stripe from 'stripe'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { apiClient } from 'service/apiClient'
import { endpoints } from 'service/apiEndpoints'
import { AxiosResponse } from 'axios'
import { routes } from 'common/routes'

const Handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { setup_intent: setupIntentId, campaignSlug } = req.query
  if (!setupIntentId || typeof setupIntentId !== 'string') {
    res.status(500).send('No setupIntentId provided or it is not a string')
    return
  }
  const paymentIntentRes = await apiClient.post<null, AxiosResponse<Stripe.PaymentIntent>>(
    endpoints.donation.finalizeSetupIntent(setupIntentId).url,
  )
  const urlToRedirect = new URL(
    `${process.env.APP_URL}/${routes.campaigns.donationStatus(campaignSlug as string)}`,
  )
  urlToRedirect.search = new URLSearchParams({
    payment_intent_client_secret: paymentIntentRes.data.client_secret as string,
    payment_intent_id: paymentIntentRes.data.id as string,
  }).toString()

  res.redirect(urlToRedirect.toString())
}

export default Handler
