import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_PREFETCH = 3

export function useSimulationPrefetch({
  currentFrame,
  totalFrames,
  seedOffset = 0,
  prefetchCount = DEFAULT_PREFETCH,
}) {
  const workerRef = useRef(null)
  const queueRef = useRef(new Map())
  const [frames, setFrames] = useState(new Map())
  const [isBusy, setIsBusy] = useState(false)

  const handleWorkerMessage = useCallback(event => {
    const { frameIndex, error, polygonsLowRes, polygonsHighRes, metadata } = event.data || {}
    if (typeof frameIndex !== 'number') {
      return
    }

    queueRef.current.delete(frameIndex)

    if (error) {
      console.warn('Simulation worker error', frameIndex, error)
      setFrames(prev => {
        const next = new Map(prev)
        next.delete(frameIndex)
        return next
      })
      return
    }

    setFrames(prev => {
      const next = new Map(prev)
      next.set(frameIndex, {
        lowRes: polygonsLowRes,
        highRes: polygonsHighRes,
        metadata,
        isHighResReady: Boolean(polygonsHighRes?.length),
      })
      return next
    })
  }, [])

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/simulationWorker.js', import.meta.url), {
        type: 'module',
      })
      workerRef.current.onmessage = handleWorkerMessage
    }
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [handleWorkerMessage])

  const scheduleFrame = useCallback(
    frameIndex => {
      if (frameIndex < 0 || frameIndex >= totalFrames) return
      if (queueRef.current.has(frameIndex) || frames.has(frameIndex)) return

      queueRef.current.set(frameIndex, true)
      setIsBusy(true)
      workerRef.current?.postMessage({ frameIndex, payload: { seedOffset } })
    },
    [totalFrames, frames, seedOffset]
  )

  useEffect(() => {
    scheduleFrame(currentFrame)
    for (let i = 1; i <= prefetchCount; i += 1) {
      const forwardIndex = currentFrame + i
      if (forwardIndex < totalFrames) {
        scheduleFrame(forwardIndex)
      }
    }
  }, [currentFrame, totalFrames, prefetchCount, scheduleFrame])

  useEffect(() => {
    if (queueRef.current.size === 0) {
      setIsBusy(false)
    }
  }, [frames])

  const currentFrameData = frames.get(currentFrame)

  return {
    currentFrameData,
    frames,
    isBusy,
    scheduleFrame,
  }
}
