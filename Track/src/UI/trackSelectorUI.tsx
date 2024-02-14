import ReactEcs, { UiEntity } from "@dcl/sdk/react-ecs"
import { Scene } from "../scene"
import { RaceMenuManager } from "../RaceMenu/raceMenuManager"

export class TrackSelectorUI {
    private static readonly SCALE: number = 0.6
    static trackSelectorUIShow: boolean = true

    private static component = () => (
        <UiEntity
            key="TrackSelectorUI"
            uiTransform={{
                positionType: 'absolute',
                position: {
                    top: "3%",
                    left: "15%",
                },
                display: TrackSelectorUI.trackSelectorUIShow && Scene.loaded ? 'flex' : 'none',
            }}
        >
            <UiEntity
                key="TrackPBtn"
                uiTransform={{
                    width: 128 * TrackSelectorUI.SCALE,
                    height: 128 * TrackSelectorUI.SCALE,
                    position: {
                        left: 0,
                        bottom: 0
                    }
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                        src: "images/ui/debugUI/trackP.png",
                        wrapMode: 'repeat'
                    }
                }}
                onMouseDown={() => {
                    RaceMenuManager.LoadTrack(0)
                }}
            ></UiEntity>
            <UiEntity
                key="Track1Btn"
                uiTransform={{
                    width: 128 * TrackSelectorUI.SCALE,
                    height: 128 * TrackSelectorUI.SCALE,
                    position: {
                        left: 20,
                        bottom: 0
                    }
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                        src: "images/ui/debugUI/track1.png",
                        wrapMode: 'repeat'
                    }
                }}
                onMouseDown={() => {
                    RaceMenuManager.LoadTrack(1)
                }}
            ></UiEntity>
            <UiEntity
                key="Track2Btn"
                uiTransform={{
                    width: 128 * TrackSelectorUI.SCALE,
                    height: 128 * TrackSelectorUI.SCALE,
                    position: {
                        left: 40,
                        bottom: 0
                    }
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                        src: "images/ui/debugUI/track2.png",
                        wrapMode: 'repeat'
                    }
                }}
                onMouseDown={() => {
                    RaceMenuManager.LoadTrack(2)
                }}
            ></UiEntity>
            <UiEntity
                key="Track3Btn"
                uiTransform={{
                    width: 128 * TrackSelectorUI.SCALE,
                    height: 128 * TrackSelectorUI.SCALE,
                    position: {
                        left: 60,
                        bottom: 0
                    }
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                        src: "images/ui/debugUI/track3.png",
                        wrapMode: 'repeat'
                    }
                }}
                onMouseDown={() => {
                    RaceMenuManager.LoadTrack(3)
                }}
            ></UiEntity>
            <UiEntity
                key="Track4Btn"
                uiTransform={{
                    width: 128 * TrackSelectorUI.SCALE,
                    height: 128 * TrackSelectorUI.SCALE,
                    position: {
                        left: 80,
                        bottom: 0
                    }
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                        src: "images/ui/debugUI/track4.png",
                        wrapMode: 'repeat'
                    }
                }}
                onMouseDown={() => {
                    RaceMenuManager.LoadTrack(4)
                }}
            ></UiEntity>
        </UiEntity>
    )

    static Render() {
        return [
            TrackSelectorUI.component()
        ]
    }
}