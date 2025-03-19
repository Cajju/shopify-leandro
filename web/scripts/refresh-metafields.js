import fetch from 'node-fetch'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

// Load environment variables from the .env file
dotenv.config({ path: '.env' })

const SECRET_LAB_KEY = process.env.SECRET_LAB_KEY

if (!SECRET_LAB_KEY) {
  throw new Error('SECRET_LAB_KEY must have a value')
}

const JWT_TOKEN = jwt.sign({}, SECRET_LAB_KEY, { expiresIn: '5m' })

const ENVIRONMENTS = {
  prd: 'https://boilerplate-app.zynclabs.com',
  stg: 'https://boilerplate-app-stg.zynclabs.com'
}

const fetchRefreshMetafields = async (environment) => {
  const url = `${ENVIRONMENTS[environment]}/secretlab/refresh-all-stores-app-metafields`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const data = await response.json()
    console.log('Response:', data)
  } catch (error) {
    console.error('Error fetching metafields:', error.message)
  }
}

async function main() {
  try {
    const environments = ['stg', 'prd']
    await Promise.all(environments.map(fetchRefreshMetafields))

    console.log('🎉 All environments updated successfully!')
  } catch (error) {
    console.error('Failed to update all environments:', error)
    process.exit(1)
  }
}

main()
