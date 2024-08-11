<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DATABASE from './database.json'

// Types
interface Syllable {
  predicted: number | null
  totalCorrect: number
}

type ConfusionMatrix = number[][]

interface ToneDatabase {
  [key: string]: string[]
}

// State
const audioPlayer = ref<HTMLAudioElement | null>(null)
const gameStage = ref<0 | 1 | 2>(0)
const numExercises = ref(10)
const tones = ref<boolean[][]>([[true, true, true, true], [true, true, true, true]])
const syllables = ref<Syllable[]>([
  { predicted: null, totalCorrect: 0 },
  { predicted: null, totalCorrect: 0 }
])
const correctWords = ref(0)
const debugInformation = ref(false)
const confusionMatrices = ref<ConfusionMatrix[]>([
  Array(4).fill(null).map(() => Array(4).fill(0)),
  Array(4).fill(null).map(() => Array(4).fill(0))
])
const curQuestion = ref(0)
const allDatabaseSize = Object.values(DATABASE.tones).reduce((acc, arr) => acc + arr.length, 0)
const toneDatabaseSize = ref(0)
const toneDatabase = ref<ToneDatabase>({})
const quizTones = ref<string[]>([])
const startTimeQuiz = ref(0)
const startTimeWord = ref(0)
const elapsedTimeWords = ref<number[]>([])
const elapsedTimeQuiz = ref(0)
const quizTonesNoNum = ref<string[][]>([])
const quizTonesOnlyNum = ref<number[][]>([])

// Computed
const progressPercentage = computed(() =>
  Math.round(100 * (curQuestion.value + 1) / numExercises.value)
)

// Methods
/**
 * Shuffles an array in place.
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

/**
 * Copies the export text to the clipboard.
 */
function copyURL() {
  const exportElement = document.getElementById('exportText')
  if (!exportElement) return

  const htmlContent = exportElement.innerHTML.replace(/<br\s*\/?>/gi, '\n')
  const tempElement = document.createElement('div')
  tempElement.innerHTML = htmlContent
  const textContent = tempElement.textContent || tempElement.innerText || ''

  navigator.clipboard.writeText(textContent)
    .then(() => alert('Copied to clipboard'))
    .catch(() => alert('Cannot copy'))
}

/**
 * Plays the audio for the current question.
 */
function playAudio() {
  const cur = quizTones.value[curQuestion.value]
  if (!audioPlayer.value) {
    audioPlayer.value = new Audio()
  }
  
  audioPlayer.value.src = `static/${cur}.m4a`
  audioPlayer.value.load()
  
  audioPlayer.value.oncanplaythrough = () => {
    const playPromise = audioPlayer.value?.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error('Audio playback failed:', error)
      })
    }
  }
  
  audioPlayer.value.onerror = (e) => {
    console.error('Audio loading error:', e)
  }
}

function cleanupAudio() {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.src = ''
    audioPlayer.value = null
  }
}

/**
 * Filters the database based on selected tones.
 */
function filterDatabase() {
  const firstSyllable = boolToIndex(tones.value[0])
  const secondSyllable = boolToIndex(tones.value[1])

  toneDatabase.value = {}
  toneDatabaseSize.value = 0

  for (const [key, value] of Object.entries(DATABASE.tones)) {
    if (key.length !== 2) continue
    if (firstSyllable.includes(Number(key[0])) && secondSyllable.includes(Number(key[1]))) {
      toneDatabase.value[key] = shuffleArray(value)
      toneDatabaseSize.value += value.length
    }
  }
}

/**
 * Draws random words from the filtered database.
 * @returns An array of randomly selected words
 */
function randomDraw(): string[] {
  const randomKeys = shuffleArray(Object.keys(toneDatabase.value))
  const selectedWords: string[] = []

  for (let i = 0; i < numExercises.value; i++) {
    const randomKey = randomKeys[i % randomKeys.length]
    const randomTonesList = toneDatabase.value[randomKey]
    const j = Math.floor(i / randomKeys.length)

    if (j < randomTonesList.length) {
      selectedWords.push(randomTonesList[j])
    }
  }

  return shuffleArray(selectedWords)
}

/**
 * Converts a boolean array to an array of indices where true values are found.
 * @param booleanArray Array of booleans
 * @returns Array of indices where the input array is true
 */
function boolToIndex(booleanArray: boolean[]): number[] {
  return booleanArray.reduce((acc, value, index) => value ? [...acc, index + 1] : acc, [] as number[])
}

/**
 * Resets the quiz to its initial state.
 */
function resetQuiz() {
  gameStage.value = 0
  filterDatabase()
}

/**
 * Sets the predicted answer for a syllable.
 * @param predictedTone The predicted tone
 * @param syllableNum The syllable number (0 or 1)
 */
function setAnswer(predictedTone: number, syllableNum: number) {
  syllables.value[syllableNum].predicted = predictedTone
}

/**
 * Processes the current question and moves to the next one.
 */
function setNextQuestion() {
  let totalCorrect = true
  for (let i = 0; i < syllables.value.length; i++) {
    const groundTruthTone = quizTonesOnlyNum.value[curQuestion.value][i]
    const predictedTone = syllables.value[i].predicted
    if (predictedTone === null) continue

    const isCorrect = groundTruthTone === predictedTone
    totalCorrect = totalCorrect && isCorrect
    syllables.value[i].totalCorrect += isCorrect ? 1 : 0
    confusionMatrices.value[i][groundTruthTone][predictedTone]++

    syllables.value[i].predicted = null
  }
  correctWords.value += Number(totalCorrect)

  elapsedTimeWords.value.push((Date.now() - startTimeWord.value) / 1000)
  startTimeWord.value = Date.now()
  elapsedTimeQuiz.value = (Date.now() - startTimeQuiz.value) / 1000

  if (curQuestion.value === numExercises.value - 1) {
    gameStage.value = 2
  } else {
    curQuestion.value++
    playAudio()
  }
}

/**
 * Starts a new quiz.
 */
function startQuiz() {
  gameStage.value = 1
  curQuestion.value = 0
  syllables.value.forEach(syllable => {
    syllable.totalCorrect = 0
    syllable.predicted = null
  })
  correctWords.value = 0
  confusionMatrices.value = [
    Array(4).fill(null).map(() => Array(4).fill(0)),
    Array(4).fill(null).map(() => Array(4).fill(0))
  ]
  elapsedTimeWords.value = []
  startTimeQuiz.value = Date.now()
  startTimeWord.value = Date.now()

  quizTones.value = randomDraw()
  const splitTones = quizTones.value.map(tone => tone.split('_'))
  quizTonesNoNum.value = splitTones.map(([tone1, tone2]) => [tone1.slice(0, -1), tone2.slice(0, -1)])
  quizTonesOnlyNum.value = splitTones.map(([tone1, tone2]) => [Number(tone1.slice(-1)) - 1, Number(tone2.slice(-1)) - 1])

  numExercises.value = quizTones.value.length
  playAudio()
}

// Lifecycle hooks
onMounted(() => {
  filterDatabase()
  audioPlayer.value = new Audio()
})

onUnmounted(() => {
  cleanupAudio()
})
</script>

<template>
  <div class="container">
    <main class="form-signin m-auto">
      <h1>Mandarin tone trainer</h1>
      <hr>
      <template v-if="(gameStage != 0) && (gameStage != 2)">
        <h4>Select the correct tones</h4>

        <div class="d-flex justify-content-between">
          <div>Progress:</div>
          <div>Word: {{ curQuestion + 1 }} / {{ numExercises }}</div>
        </div>

        <div class="progress">
          <div class="progress-bar" role="progressbar" :style="{ 'width': progressPercentage + '%' }" aria-valuemin="0"
            aria-valuemax="100"></div>
        </div>
      </template>
      <h4 v-else-if="(gameStage == 2)">Evaluation</h4>
      <h4 v-else>Settings</h4>

      <div v-if="gameStage == 0">
        <div class="mb-3 mt-4 row">
          <template v-for="(syllable, syllable_num) in syllables">
            <label class="col-sm-2 col-form-label">Syllable {{ syllable_num + 1 }}:</label>
            <div class="col-sm-10 pt-15">
              <div class="form-check form-check-inline" v-for="n in tones[syllable_num].length">
                <input class="form-check-input" type="checkbox" :id="`checkbox1_${n}`"
                  v-model="tones[syllable_num][n - 1]" @change="filterDatabase()">
                <label class="form-check-label" :for="`checkbox1_${n}`">Tone {{ n }}</label>
              </div>
            </div>
          </template>
        </div>

        <div class="mb-3 row">
          <label for="numExercises" class="col-sm-2 col-form-label">Exercises:</label>
          <div class="col-sm-10">
            <select class="form-select" aria-label="Default select example" v-model="numExercises">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>75</option>
              <option>100</option>
            </select>
          </div>
        </div>

        <button :class="`btn btn-outline-light w-100 py-2 mt-4 ${toneDatabaseSize == 0 ? 'disabled' : ''}`"
          type="submit" @click="startQuiz()">Start</button>
      </div>
      <div class="container text-center" v-else-if="gameStage != 2">
        <div class="row align-items-start">
          <div class="mt-4">
            <button type="button" class="btn btn-outline-light" @click="playAudio()">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play"
                viewBox="0 0 16 16">
                <path
                  d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z">
                </path>
              </svg>
            </button>
          </div>

          <div class="col" v-for="(syllable, syllable_num) in syllables">
            <div class="row mt-4">
              <button class="" type="button" v-for="(tone, tone_num) in tones[syllable_num]" :disabled="tone !== true"
                :class="`col-md-8 offset-md-2 mb-2 btn ${(syllable.predicted != null) && (quizTonesOnlyNum[curQuestion][syllable_num] == tone_num) ? 'btn-success ' : ((syllable.predicted == tone_num) && (quizTonesOnlyNum[curQuestion][syllable_num] != tone_num) ? 'btn-danger ' : 'btn-outline-light')
                  } ${syllable.predicted != null ? 'disabled' : ''
                  }`" @click="setAnswer(tone_num, syllable_num)">{{ quizTonesNoNum[curQuestion][syllable_num] }}{{
                    tone_num +
                    1 }}</button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <button class="col-md-3 btn btn-outline-light" @click="resetQuiz()"><svg xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
              <path fill-rule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
            </svg> Restart</button>

          <button
            :class="`col-md-3 btn btn-outline-light ${(syllables[0].predicted == null) || (syllables[1].predicted == null) ? 'disabled' : ''}`"
            type="button" @click="setNextQuestion()">{{
              (curQuestion == numExercises - 1) ? 'Finish' : 'Next'
            }} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-arrow-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
            </svg></button>
        </div>
      </div>
      <div v-else>
        <div class="row mb-3 mt-4">
          <h6>You finished this quiz in {{ (elapsedTimeQuiz / 60).toFixed(2) }} minutes ({{
            (elapsedTimeWords.reduce((a, b) =>
              (a + b)) / elapsedTimeWords.length).toFixed(2) }} sec/word).</h6>
        </div>

        <div class="row text-center mb-3">
          <div class="col">
            <h5>Word</h5>
            <svg width="100" viewBox="0 0 20 20" class="stat-circle">
              <circle cx="10" cy="10" r="8" class="bg"></circle>
              <circle cx="10" cy="10" r="8" class="progress"
                :style="{ 'stroke-dashoffset': Math.round(-51 - (51 * correctWords / numExercises)) + 'px' }"></circle>
              <text x="50%" y="55%">{{ Math.round(100 * correctWords / numExercises) }}%</text>
            </svg>
          </div>

          <div class="col" v-for="(syllable, syllable_num) in syllables">
            <h5>Syllable {{ syllable_num + 1 }}</h5>
            <svg width="100" viewBox="0 0 20 20" class="stat-circle">
              <circle cx="10" cy="10" r="8" class="bg"></circle>
              <circle cx="10" cy="10" r="8" class="progress"
                :style="{ 'stroke-dashoffset': Math.round(-51 - (51 * syllables[syllable_num]['totalCorrect'] / numExercises)) + 'px' }">
              </circle>
              <text x="50%" y="55%">{{ Math.round(100 * syllables[syllable_num]["totalCorrect"] /
                numExercises) }}%</text>
            </svg>
          </div>
        </div>

        <div class="row mb-3 mt-4">
          <h6><b>{{ correctWords }}</b> out of <b>{{ numExercises }}</b> words were correct.
            <template v-if="correctWords == numExercises">
              You made no mistakes. Congratulations!
            </template>
            <template v-else-if="syllables[0]['totalCorrect'] == syllables[1]['totalCorrect']">
              You made the same number of mistakes on both the first and the second syllable.
            </template>
            <template v-else>
              Most of your mistakes are with the <b>{{ syllables[0]['totalCorrect'] > syllables[1]['totalCorrect'] ?
                'second' : 'first' }}</b> syllable.
            </template>
          </h6>
        </div>

        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">Export results</h1>
              </div>
              <div class="modal-body" id="exportText">
                General<br>
                --------<br>
                Number of words: {{ numExercises }}<br>
                Selected tones: {{ boolToIndex(tones[0]).toString() }} and {{ boolToIndex(tones[1]).toString() }}<br>
                Elapsed time: {{ (elapsedTimeQuiz / 60).toFixed(2) }} minutes ({{ (elapsedTimeWords.reduce((a, b) =>
                  (a + b)) /
                  elapsedTimeWords.length).toFixed(2) }} sec/word)<br>
                <br>
                Word/Syllables<br>
                ----------------<br>
                Word acc: {{ 100 * correctWords / numExercises }}%<br>
                <template v-for="(syllable, syllable_num) in syllables">
                  Syllable {{ syllable_num + 1 }} acc: {{ 100 * syllables[syllable_num]["totalCorrect"] / numExercises
                  }}%<br>
                </template>
                <template v-if="debugInformation">
                  <br>
                  Debug information<br>
                  --------------------<br>

                  Confusion matrices: {{ confusionMatrices }}
                  <br>
                  Words: {{ quizTones.map(tone => tone.split('_', 2)) }}
                  <br>
                  Elapsed time by word: {{ elapsedTimeWords }}
                </template>
              </div>
              <div class="modal-footer d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <input class="form-check-input" type="checkbox" id="moreDetailCheckbox" v-model="debugInformation">
                  <label class="form-check-label ms-2" for="moreDetailCheckbox">Debug information</label>
                </div>
                <div>
                  <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal"><svg
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
                      viewBox="0 0 16 16">
                      <path
                        d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg> Close</button>
                  <button type="button" class="btn btn-outline-light" @click="copyURL()"><svg
                      xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy"
                      viewBox="0 0 16 16">
                      <path fill-rule="evenodd"
                        d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                    </svg> Copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="mt-4 text-center">
          <button class="col-md-3 btn btn-outline-light" @click="resetQuiz()"><svg xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
              <path fill-rule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
            </svg> Play Again</button>

          <button class="col-md-3 btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#exampleModal">Export
            results</button>
        </div>


      </div>


      <footer class="py-3 my-4 border-top" v-if="gameStage == 0">
        <p class="text-body-secondary">{{ allDatabaseSize }} words in database{{ allDatabaseSize != toneDatabaseSize ?
          ", "
          +
          toneDatabaseSize + " with current settings" : "" }}</p>
      </footer>

      <footer class="py-3 my-4 border-top" v-if="gameStage == 1">

        <div class="d-flex justify-content-between">
          <div>
            Syllable accuracy: {{ curQuestion == 0 ? 100 : Math.round(100 * (syllables[0]["totalCorrect"] +
              syllables[1]["totalCorrect"]) / (2 * curQuestion)) }}%
          </div>
          <div>
            Word accuracy: {{ curQuestion == 0 ? 100 : Math.round(100 * correctWords / curQuestion) }}%
          </div>
        </div>
      </footer>

    </main>
  </div>
</template>