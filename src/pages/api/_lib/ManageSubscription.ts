import { UserRepository } from '../../../services/UserRepository'
import { SubscriptionRepository } from '../../../services/SubscriptionRepository'
import { PaymentService } from '../../../services/PaymentService'

export async function saveSubscription(subscriptionId: string, customerId: string, createAction = false) {
  const userRepo = new UserRepository()  
  const user = await userRepo.getUserByStripeCustomerId(customerId)
  const paymentService = new PaymentService()
  const subscription = await paymentService.getSubscription(subscriptionId)
  const subscriptionRepo = new SubscriptionRepository()
  if (createAction) {
    await subscriptionRepo.saveSubscription({
      id: subscription.id,
      userId: user.ref.id,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id
    })
  } else {
    await subscriptionRepo.replaceSubscription({
      id: subscription.id,
      userId: user.ref.id,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id
    })
  }
}