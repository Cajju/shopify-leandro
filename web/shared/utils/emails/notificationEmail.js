import basicLayout from './basicLayout.js'

const notificationEmail = ({ userName = '', message = '', buttonUrl = '', buttonText = '' }) => {
  const html = `
    <div style="font-feature-settings:'pnum','nalt';background-color:#ffffff;margin:0;padding:0;width:100%;">
  <div class="section" style="margin:0 auto;max-width:600px;width:100%;box-sizing:border-box;">
    <!-- Logo Section -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
      <tbody>
        <tr>
          <td style="padding:20px 10px 30px 10px;text-align:center">
            <img height="48" src="https://cdn.shopify.com/s/files/1/0696/3544/0837/files/logo3.png?v=1739282248" 
                 style="border:0;display:block;outline:none;text-decoration:none;width:auto;max-width:100%;margin:0;"
                 alt="Boxhead Bundles Logo">
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Welcome Message -->
    <div style="padding:0 10px;">
      <div style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;text-align:left;color:#000000;word-wrap:break-word;">
        Hi ${userName},
        <br><br>
        ${message}
      </div>
    </div>


    <!-- CTA Button -->
    <div style="padding:0 10px 30px 10px">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
        <tr>
          <td align="center">
            <a href="${buttonUrl}" 
               style="background:#FF9192;color:#666;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;line-height:24px;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;width:100%;max-width:350px;text-align:center;box-sizing:border-box;">
              ${buttonText}
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 10px 20px 10px">
      <div style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;text-align:left;color:#000000;word-wrap:break-word;">
        Thanks,<br>
        The Boxhead Bundles Team
      </div>
    </div>
  </div>
</div>
  `
  return basicLayout(html)
}

export default notificationEmail
