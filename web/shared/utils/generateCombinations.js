function generateCombinations(elements, charLimits, combinationLength) {
  const results = []

  // Sort elements first to help maintain order and avoid duplicates
  elements.sort()

  function backtrack(currentCombination, startIndex, remainingLimits) {
    if (currentCombination.length === combinationLength) {
      results.push([...currentCombination])
      return
    }

    // Start from startIndex to maintain order and avoid duplicates
    for (let i = startIndex; i < elements.length; i++) {
      const elem = elements[i]
      const charType = elem[0]

      if (remainingLimits[charType] <= 0) continue

      currentCombination.push(elem)
      remainingLimits[charType]--

      // Next iteration starts from i to allow using the same character type
      backtrack(currentCombination, i, remainingLimits)

      currentCombination.pop()
      remainingLimits[charType]++
    }
  }

  backtrack([], 0, { ...charLimits })
  return results
}

// Example usage:
const elements = ['A1', 'A2', 'A3', 'B1', 'B2']
const charLimits = { A: 2, B: 1 }
const combinations = generateCombinations(elements, charLimits, 3)
combinations.forEach((combo) => console.log(combo.join(' ')))
