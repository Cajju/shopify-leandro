const config = {
  BillingInterval: {
    OneTime: 'ONE_TIME',
    Every30Days: 'EVERY_30_DAYS',
    Annual: 'ANNUAL'
  },
  currencyCode: {
    USD: 'USD'
  },
  isFreePlanAvailable: process.env.IS_FREE_PLAN_AVAILABLE === 'true',
  realCharge: process.env.REAL_CHARGE === 'true',
  defaultTrialDays: 14,
  pricing: [
    {
      name: 'Basic',
      price: 0,
      limit: {
        maxEmails: 30
      }
    },
    {
      name: 'Startup',
      price: 9.99,
      limit: {
        maxEmails: 200
      }
    },
    {
      name: 'Pro',
      price: 19.99,
      limit: {
        maxEmails: 1000
      }
    },
    {
      name: 'Enterprise',
      price: 39.99,
      limit: {
        maxEmails: 3000
      }
    }
  ]
}

export default config
