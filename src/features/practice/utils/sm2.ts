export interface SM2State {
  interval: number
  easinessFactor: number
  repetitions: number
}

export function calculateSM2(state: SM2State, quality: 0|1|2|3|4|5): SM2State {
  let { interval, easinessFactor, repetitions } = state
  easinessFactor = Math.max(1.3, easinessFactor + 0.1 - (5-quality)*(0.08+(5-quality)*0.02))
  if (quality < 3) { repetitions = 0; interval = 1 }
  else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easinessFactor)
    repetitions += 1
  }
  return { interval, easinessFactor, repetitions }
}

export function answerToQuality(isCorrect: boolean, timeSeconds: number): 0|1|2|3|4|5 {
  if (!isCorrect) return timeSeconds < 5 ? 0 : 1
  if (timeSeconds > 90) return 3
  if (timeSeconds > 45) return 4
  return 5
}

export function nextReviewDate(intervalDays: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + intervalDays)
  return date
}

export const SM2_INITIAL_STATE: SM2State = { interval: 1, easinessFactor: 2.5, repetitions: 0 }
