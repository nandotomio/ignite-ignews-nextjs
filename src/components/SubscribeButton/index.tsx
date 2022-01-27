import { useSession, signIn } from 'next-auth/react'
import { HttpClientService } from '../../services/HttpClientService';
import { redirectToStripeCheckout } from '../../services/StripeService';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession()
  
  async function handleSubscribe() {
    if (!session) {
      signIn('github')
      return;
    }

    try {
      const api = new HttpClientService()
      const response = await api.request({
        method: 'post',
        url: '/subscribe'
      })
      const { sessionId } = response.body
      await redirectToStripeCheckout(sessionId)
    } catch (error) {
      alert(error.message)
    }
  }
  
  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}