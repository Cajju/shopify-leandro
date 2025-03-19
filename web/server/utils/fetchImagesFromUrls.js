const fetchImagesFromUrls = async (urls) => {
  const imageBuffers = await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}`)
      }
      const buffer = await response.arrayBuffer()
      return Buffer.from(buffer)
    })
  )
  return imageBuffers
}

export default fetchImagesFromUrls
