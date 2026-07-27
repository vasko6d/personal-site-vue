<script setup lang="ts">
import { ref } from 'vue'
import ClimberAnalysis from '@/components/climbing/ClimberAnalysis.vue'

const ascentJsonFile = ref<string | undefined>(undefined)
const ascentJson = ref<{ ascents: Record<string, unknown>[] } | undefined>(undefined)
const climberName = ref<string | false>(false)
const rawAreaText = ref<string | undefined>(undefined)
const importError = ref<string | undefined>(undefined)
const initialized = ref(false)

const ascentFile = ref<HTMLInputElement | null>(null)
const rawJson = ref<HTMLTextAreaElement | null>(null)

function onFileSelect(event: Event) {
  climberName.value = false
  initialized.value = false
  ascentJsonFile.value = (event.target as HTMLInputElement).value
  rawAreaText.value = undefined
  if (rawJson.value) rawJson.value.value = ''
}

function onTextAreaChange() {
  climberName.value = false
  initialized.value = false
  ascentJsonFile.value = undefined
  setTimeout(() => {
    rawAreaText.value = rawJson.value?.value
  })
}

function analyzeRawText() {
  try {
    const json = JSON.parse(rawAreaText.value ?? '')
    validateJson(json, true)
  } catch (e) {
    importError.value = `"Unparsable JSON: ${e}"`
    alert(importError.value)
  }
}

function goToMy8aJson() {
  window.open(
    'https://www.8a.nu/api/unification/ascent/v1/web/users/david-vasko/ascents?category=bouldering&pageIndex=0&pageSize=6000',
    '_blank',
  )
}

function onAnalyze() {
  const file = ascentFile.value?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.readAsText(file, 'UTF-8')
  reader.onload = (evt) => validateJson(JSON.parse(evt.target?.result as string))
  reader.onerror = (evt) => console.error(evt)
}

function validateJson(
  jsonToValidate: { ascents?: Record<string, unknown>[]; totalItems?: number },
  isRaw?: boolean,
) {
  if (
    jsonToValidate &&
    jsonToValidate.ascents &&
    jsonToValidate.ascents.length &&
    jsonToValidate.totalItems
  ) {
    climberName.value = jsonToValidate.ascents[0]!.userName as string
    ascentJson.value = jsonToValidate as { ascents: Record<string, unknown>[] }
    console.log(
      `Sucesfully parsed local JSON file for climber [${climberName.value}], with [${ascentJson.value.ascents.length}] climbs`,
    )
  } else {
    importError.value = isRaw
      ? 'Raw Json does not have the expected fields for 8a'
      : 'Ascent File does not have the expected fields for 8a'
    alert(importError.value)
  }
}
</script>

<template>
  <div id="import-analysis">
    <div>
      <div class="blk-container">
        <h1>Analysis Importer</h1>
        <div class="bg1">
          <h3 style="text-align: left">Get 8a Data</h3>
          <p style="text-align: left">
            Select a local JSON file of ascents from 8a.nu to view the analytics of a climber not in
            the sandbox. Get it by using the following url <strong>when logged into</strong> 8a.nu.
            If you click the below link it will take you to my ascent response. Simply change the
            section marked "user-name" to the kebab username of the user you want to analyze.
          </p>
          <p class="eight-a-url bg1-hvr bg1-txt-hvr" @click="goToMy8aJson()">
            https://www.8a.nu/api/unification/ascent/v1/web/users/<strong>{user-name}</strong>/ascents?category=bouldering&amp;pageIndex=0&amp;pageSize=<strong
              >{total-ascents}</strong
            >
          </p>
          <hr style="margin: 20px 0" />
          <h3 style="text-align: left">Analyze Via Saved File</h3>
          <p style="text-align: left">
            After using the above URL you should see a ton of text in the broswer. Right click
            anywhere and then click "Save as.." and save it somewhere on your computer (I did not
            figure out how to do this on my phone). Remember where you saved it then click the
            "Choose File" button below and find it. It looks specifically for ".json" files so make
            sure you save the file with a ".json" extension
          </p>
          <div class="import-btn">
            <input type="file" ref="ascentFile" accept=".json" @change="onFileSelect($event)" />
          </div>
          <div
            v-if="ascentJsonFile && !initialized"
            class="cbtn prm bg1-hvr bg1-txt-hvr"
            @click="onAnalyze()"
          >
            Analyze Json File
          </div>
          <hr style="margin: 20px 0" />
          <h3 style="text-align: left">Analyze Via Pasted Text</h3>
          <p style="text-align: left">
            Or alternatively copy paste the JSON response text into the below. This is possible on a
            phone, but you have to figure out how to select all on your device.
          </p>
          <div class="import-btn">
            <textarea
              ref="rawJson"
              style="width: 90%; height: 100px"
              @keyup.enter="onTextAreaChange()"
              @paste="onTextAreaChange()"
              @blur="onTextAreaChange()"
            />
          </div>
          <div
            v-if="rawAreaText && !initialized"
            class="cbtn prm bg1-hvr bg1-txt-hvr"
            @click="analyzeRawText()"
          >
            Analyze Raw Json Text
          </div>
        </div>
      </div>
    </div>
    <div v-if="climberName">
      <ClimberAnalysis
        :climberName="climberName"
        :rawAscents="ascentJson!.ascents"
        @initialized="initialized = true"
      ></ClimberAnalysis>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/table-container';
#import-analysis {
  display: flex;
  flex-direction: column;
  .blk-container {
    margin-bottom: 5px;
    margin-top: 5px;
    width: 100%;
  }
}
.bg1 {
  padding: 10px;
}
.cbtn:hover {
  cursor: pointer;
}
.import-btn {
  margin-top: 10px;
  margin-bottom: 20px;
}
.eight-a-url {
  @extend .bg1;
  font-size: 10pt;
  margin: 15px;
  cursor: pointer;
}
</style>
