import { GetStaticProps } from 'next'

import Head from 'next/head'
import { SubscribeButton } from '../components/SubscribeButton'
import { SubscriptionPrice } from '../interfaces/Subscription'
import { PaymentService } from '../services/PaymentService'

import styles from './home.module.scss'

interface HomeProps {
  subscriptionPrice: SubscriptionPrice
}

export default function Home({ subscriptionPrice }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {subscriptionPrice.amount}/month</span>
          </p>
          <SubscribeButton priceId={subscriptionPrice.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Dev coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const paymentService = new PaymentService()
  const subscriptionPrice = await paymentService.getSubscriptionPrice()
  const revalidateIn24Hours = 60 * 60 * 24
  return {
    props: {
      subscriptionPrice
    },
    revalidate: revalidateIn24Hours
  }
}