import { NextApiHandler } from 'next'
import { getSession } from 'next-auth/react'

import { PaymentService } from '../../services/PaymentService'

const apiHandler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const session = await getSession({ req })
      const paymentService = new PaymentService()
      const sessionId = await paymentService.createCheckoutSession(session.user.email)
      return res.status(200).json({ sessionId })
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}

export default apiHandler