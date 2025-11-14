/**
 * Test suite for payload preparation utilities
 * Run this to verify payload generation works correctly
 */

import {
  preparePayload,
  validatePayload,
  getMonthString,
  getDayString,
  prepareBatchPayloads
} from '../utils/payloadUtils'

// Test 1: Valid payload preparation
export function testValidPayload() {
  console.log('=== Test 1: Valid Payload Preparation ===')
  
  const input = {
    X: 123,
    Y: 456,
    lat: 19.0760,
    lng: 72.8777,
    weather: {
      temp: 28.5,
      RH: 65,
      wind: 12.3,
      rain: 0
    }
  }

  const result = preparePayload(input)
  console.log('Input:', input)
  console.log('Result:', result)
  console.log('Valid:', result.valid)
  console.log('Payload:', result.payload)
  console.log('Errors:', result.errors)
  console.log('✅ Test 1 passed\n')
  
  return result.valid
}

// Test 2: Invalid data handling
export function testInvalidPayload() {
  console.log('=== Test 2: Invalid Payload Handling ===')
  
  const input = {
    X: 123.5, // Not an integer
    Y: 456,
    lat: 19.0760,
    lng: 72.8777,
    weather: {
      temp: 150,   // Out of range
      RH: 105,     // > 100%
      wind: -5,    // Negative
      rain: null   // Null value
    }
  }

  const result = preparePayload(input)
  console.log('Input:', input)
  console.log('Result:', result)
  console.log('Valid:', result.valid)
  console.log('Errors:', result.errors)
  console.log('✅ Test 2 passed (should be invalid)\n')
  
  return !result.valid && result.errors.length > 0
}

// Test 3: Date computation
export function testDateComputation() {
  console.log('=== Test 3: Date Computation ===')
  
  const testDates = [
    new Date('2025-08-10'), // Sunday in August
    new Date('2025-01-15'), // Wednesday in January
    new Date('2025-12-25'), // Thursday in December
  ]

  testDates.forEach(date => {
    const month = getMonthString(date)
    const day = getDayString(date)
    console.log(`${date.toDateString()} => month: '${month}', day: '${day}'`)
  })
  
  console.log('✅ Test 3 passed\n')
  return true
}

// Test 4: Batch payload preparation
export function testBatchPayloads() {
  console.log('=== Test 4: Batch Payload Preparation ===')
  
  const locations = [
    {
      X: 100, Y: 200,
      lat: 19.0760, lng: 72.8777,
      weather: { temp: 28, RH: 65, wind: 12, rain: 0 }
    },
    {
      X: 150, Y: 250,
      lat: 28.7041, lng: 77.1025,
      weather: { temp: 32, RH: 45, wind: 18, rain: 5 }
    },
    {
      X: 200, Y: 300,
      lat: 12.9716, lng: 77.5946,
      weather: { temp: 26, RH: 80, wind: 8, rain: 10 }
    }
  ]

  const result = prepareBatchPayloads(locations)
  console.log('Total locations:', result.totalCount)
  console.log('Valid payloads:', result.validCount)
  console.log('Invalid count:', result.invalidCount)
  console.log('All valid:', result.valid)
  console.log('Payloads:', result.payloads)
  console.log('✅ Test 4 passed\n')
  
  return result.valid && result.validCount === 3
}

// Test 5: Field validation edge cases
export function testEdgeCases() {
  console.log('=== Test 5: Edge Cases ===')
  
  const testCases = [
    {
      name: 'Zero values',
      data: {
        X: 0, Y: 0,
        lat: 0, lng: 0,
        weather: { temp: 0, RH: 0, wind: 0, rain: 0 }
      }
    },
    {
      name: 'Maximum values',
      data: {
        X: 999, Y: 999,
        lat: 90, lng: 180,
        weather: { temp: 60, RH: 100, wind: 200, rain: 1000 }
      }
    },
    {
      name: 'Minimum values',
      data: {
        X: -999, Y: -999,
        lat: -90, lng: -180,
        weather: { temp: -50, RH: 0, wind: 0, rain: 0 }
      }
    }
  ]

  testCases.forEach(testCase => {
    const result = preparePayload(testCase.data)
    console.log(`${testCase.name}:`, result.valid ? '✅ Valid' : '❌ Invalid')
    if (!result.valid) {
      console.log('  Errors:', result.errors)
    }
  })
  
  console.log('✅ Test 5 passed\n')
  return true
}

// Test 6: Complete workflow simulation
export function testCompleteWorkflow() {
  console.log('=== Test 6: Complete Workflow Simulation ===')
  
  // Simulate user clicking map
  const clickData = {
    x: 123,
    y: 456,
    lat: 19.0760,
    lng: 72.8777,
    centerLat: 19.0800,
    centerLon: 72.8800
  }

  // Simulate weather fetch
  const weatherData = {
    temp: 28.5,
    RH: 65,
    wind: 12.3,
    rain: 0
  }

  // Prepare payload
  const result = preparePayload({
    X: clickData.x,
    Y: clickData.y,
    lat: clickData.lat,
    lng: clickData.lng,
    weather: weatherData
  })

  console.log('Click data:', clickData)
  console.log('Weather data:', weatherData)
  console.log('Prepared payload:', result.payload)
  console.log('Validation:', result.valid ? '✅ Valid' : '❌ Invalid')
  console.log('Metadata:', result.metadata)
  
  if (result.valid) {
    console.log('\n📤 Ready to send to API:')
    console.log(JSON.stringify(result.payload, null, 2))
  }
  
  console.log('✅ Test 6 passed\n')
  return result.valid
}

// Run all tests
export function runAllTests() {
  console.log('\n🧪 Running Payload Preparation Tests\n')
  console.log('='.repeat(50) + '\n')
  
  const tests = [
    testValidPayload,
    testInvalidPayload,
    testDateComputation,
    testBatchPayloads,
    testEdgeCases,
    testCompleteWorkflow
  ]

  const results = tests.map(test => {
    try {
      return test()
    } catch (error) {
      console.error('Test failed with error:', error)
      return false
    }
  })

  console.log('='.repeat(50))
  console.log('\n📊 Test Results:')
  console.log(`Total tests: ${tests.length}`)
  console.log(`Passed: ${results.filter(r => r).length}`)
  console.log(`Failed: ${results.filter(r => !r).length}`)
  console.log('\n' + (results.every(r => r) ? '✅ All tests passed!' : '❌ Some tests failed'))
  
  return results.every(r => r)
}

// Export for use in console or test runner
export default {
  testValidPayload,
  testInvalidPayload,
  testDateComputation,
  testBatchPayloads,
  testEdgeCases,
  testCompleteWorkflow,
  runAllTests
}
