import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { SpeedometerUI, TimeUI, CarChoiceUI, Countdown } from '@vegascity/racetrack/src/ui'
import { Minimap } from '@vegascity/racetrack/src/ui'
import { DebugUI } from './debugUI'
import { TrackSelectorUI } from './trackSelectorUI'
import { UiCanvasInformation, engine } from '@dcl/sdk/ecs'
import { CarSelectionUI } from './carSelectionUI'
import * as  ui from 'dcl-ui-toolkit'

const uiComponent = () => (
  [
    SpeedometerUI.Render(),
    TimeUI.Render(),
    TrackSelectorUI.Render(),
    Countdown.Render(),
    DebugUI.Render(),
    CarSelectionUI.Render(),
    CarChoiceUI.Render(),
    Minimap.Render(),
    ui.render()
  ]
)

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
  engine.addSystem(UIScaler)
}

function UIScaler() {
  let canvas = UiCanvasInformation.get(engine.RootEntity)
  UIDimensions.width = canvas.width
  UIDimensions.height = canvas.height
  UIDimensions.minScale = Math.min(canvas.width, canvas.height)
  UIDimensions.scaler = UIDimensions.minScale / 2000
}

export let UIDimensions: any = {
  width: 0,
  height: 0,
  minScale: 0,
  scaler: 0
} 