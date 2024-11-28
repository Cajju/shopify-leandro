import React, { useEffect } from 'react'

export const CrispChat = ({ CRISP_WEBSITE_ID, sessionData }) => {
  useEffect(() => {
    window.setTimeout(runCrisp, 1)
    function runCrisp() {
      window.$crisp = []
      $crisp.push(['set', 'user:email', [sessionData.email]])
      $crisp.push(['set', 'user:nickname', [sessionData.name]])
      $crisp.push([
        'set',
        'session:data',
        [
          [
            ['pricing_plan', sessionData.pricingPlan],
            ['store_url', sessionData.domain],
            ['shopify_domain', sessionData.myshopify_domain],
            ['store_owner_name', sessionData.shop_owner],
            ['timezone', sessionData.timezone],
            ['country', sessionData.country_name],
            ['shopify_plan', sessionData.plan_name],
            ['store_created_at', sessionData.created_at],
            [
              'request_collaborator',
              `https://partners.shopify.com/2115077/stores/new?store_domain=${sessionData.myshopify_domain}&store_type=managed_store`
            ]
          ]
        ]
      ])
      window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID
      window.CRISP_TOKEN_ID = sessionData.myshopify_domain

      ;(() => {
        var d = document
        var s = d.createElement('script')

        s.src = 'https://client.crisp.chat/l.js'
        s.async = 1
        d.getElementsByTagName('head')[0].appendChild(s)
      })()
    }
  }, [])

  return (
    <div>
      <React.Suspense>
        <script type="module"></script>
      </React.Suspense>
    </div>
  )
}
